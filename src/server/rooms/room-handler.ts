import { Room, Client } from "colyseus";

import { CliManager } from "../cli/cli";
import { GameManager } from "../core";
import { Message } from "../comm";

import { JoinRoomOptions } from "./join-room.options";
import { RoomLogger } from "../core/loggers";
import { GameState, GameStateImpl, EmittedGameState } from "../state";

/**
 * This class handles all of the communication with the user.
 */
export class RoomHandler extends Room<EmittedGameState> {
    private _gameManager: GameManager;
    private _gameState: GameState;
    private _logger: RoomLogger;
    private _viewers: Set<string>;
    cli: CliManager;

    // Authorize client based on provided options before WebSocket handshake is complete
    // onAuth (options: any) { }

    // When room is initialized
    onInit (options: any) {
        this._gameState = new GameStateImpl(this.roomId);
        this._gameManager = new GameManager(this._gameState);
        this.cli = new CliManager(this._gameManager);
        this._viewers = new Set<string>();

        const state = {} as EmittedGameState;
        this.assignRoomState(state, this._gameState);
        this.setState(state);

        this.initLogger();
        this.listenForStateChange();
    }

    // Checks if a new client is allowed to join.
    requestJoin(options: JoinRoomOptions, isNew: boolean): boolean {
        this._logger.log(`User ${options.playerId ? options.playerId : options.clientId} wants to join the game as a ${options.isPlaying ? 'player': 'viewer'}.`);

        // First of, some user may want to join specific rooms. If it is the case, check if the current room is the wanted one.
        // The this.clients.length > 0 condition was added because a room is destroyed if no one is watching and viewer tries to
        // play in the room.
        if(options.roomToJoin && options.roomToJoin !== this.roomId && this.clients.length > 0) {
            return false; // This is not the room that the user wants.
        }

        // If the user wants to play the game, check if the room is full.
        if(options.isPlaying) {
            // If the player was previously viewing the game, remove him from the list of viewers.
            if (this._viewers.has(options.clientId)) {
                this._viewers.delete(options.clientId);
            }

            const numberOfPlayersInGame = Object.keys(this._gameState.players).length;

            const isRoomFull = this._gameState.maxPlayerCount <= numberOfPlayersInGame;
            const isPlayerAlreadyInRoom = this._gameState.players[options.playerId] !== undefined;
            const doPlayerWantsToRejoin = this._gameState.hasStarted && isPlayerAlreadyInRoom && this.clients.findIndex(socket => socket.id === options.playerId || socket.id === options.clientId) === -1;
            const canJoin = (!isRoomFull && !this._gameState.hasStarted && !isPlayerAlreadyInRoom) || doPlayerWantsToRejoin;

            if(this._gameState.hasStarted) {
                // If the player is player in the current game but has left the game, allow him to rejoin.
                if(doPlayerWantsToRejoin) {
                    this._logger.log("The user is rejoining the game since he left previously.");
                }

                this._logger.log("The user cannot join since the game has already started.");
            }
            else if(isRoomFull) {
                this._logger.log("The user cannot join since the room is full.");
            }
            else if(isPlayerAlreadyInRoom) {
                this._logger.log("The user cannot join the same game twice.");
            }

            return canJoin;
        }

        // Else, let him join has a viewer.
        this._viewers.add(options.clientId);
        return true;
    }

    // When client successfully join the room
    onJoin (client: Client) {
        // If the client is a player, add him to the game.
        if(!this._viewers.has(client.id)) {
            this._logger.log("The client ", client.id, " has joined the game.");
            const didJoinSucceed = this._gameManager.addPlayer(client.id);

            if(!didJoinSucceed) {
                this._logger.log(`The player with id ${client.id} was not able to join the game even though he was admitted by the requestJoin() of the room.`);
            }

            if(this._gameState.isGameFull()) {
                this._gameManager.startGame();
            }
        }
        // Else, for viewers, colyseus will handle state emission automatically.
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) {
        // If the client is a viewer, remove him from the list of viewers.
        if (this._viewers.has(client.id)) {
            this._viewers.delete(client.id);
        }
        // If he is a player, remove him from the game.
        else {
            this._gameManager.removePlayer(client.id);
            if(this._gameState.hasStarted) {
                this._logger.log("The player ", client.id, " has left the game.");
            }
        }
    }

    // When a client sends a message. This is where user actions come from.
    onMessage (client: Client, message: Message) {
        if(message.type === "PlayerAction") {
            const newActions = message.payload;
            this._gameManager.updatePlayerActions(newActions);
        }
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {
        this._logger.log("Cleaning up room...");
        this._gameState.cleanUpRessources();
        this.cli.cleanUpResources();
    }

    private listenForStateChange() {
        // Listen for specific events from the state.
        this._gameState.onGameOver().subscribe(() => {
            console.log("Game is over! Blocking all incoming actions.");
            // Wait for clients to handle end of game properly, then close the room.
            setTimeout(() => this.disconnect(), 2000);
        });

        this._gameState.onStateChanged().subscribe(() => {
            this.updateRoomState(this._gameState);
        });
    }


    private updateRoomState(gameState: GameState): void {
        this.assignRoomState(this.state, gameState);
    }

    private assignRoomState(target: EmittedGameState, gameState: GameState): void {
        target.gameId = gameState.gameId;
        target.gameMap = gameState.gameMap;
        target.players = gameState.players;
        target.bombs = gameState.bombs;
        target.collectibles = gameState.collectibles;
        target.paused = gameState.paused;
        target.isOver = gameState.isOver;
        target.hasStarted = gameState.hasStarted;
        target.time = gameState.time;
        target.winner = gameState.winner;
        target.maxPlayerCount = gameState.maxPlayerCount;
    }

    private initLogger() {
        const currentTime = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        this._logger = new RoomLogger(this.roomId, this.roomId + "&" + currentTime);
        this._logger.log('THESE ARE THE LOGS FROM ROOM ID:', this.roomId);
    }
}
