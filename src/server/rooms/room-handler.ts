import { Room, Client } from "colyseus";
import { Unsubscribe, Store } from "redux";

import { CliManager } from "../cli/cli";
import { GameManager } from "../core";
import { Message } from "../comm";

import * as fromState from "../state";
import * as fromServer from 'dci-game-server';
import { JoinRoomOptions } from "./join-room.options";
import { RoomLogger } from "../core/loggers";

/**
 * This class handles all of the communication with the user.
 */
export class RoomHandler extends Room<fromState.GameState> {
    private _gameManager: GameManager;
    private _store: Store<fromState.State, fromServer.GameAction>;
    private _unsubscribeFromStore: Unsubscribe;
    private _logger: RoomLogger;
    private _viewers: Set<string>;
    cli: CliManager;
    maxClients = 4;

    // Authorize client based on provided options before WebSocket handshake is complete
    // onAuth (options: any) { }

    // When room is initialized
    onInit (options: any) {
        this._store = fromState.createStore(this.roomId);
        this._gameManager = new GameManager(this._store, this.maxClients);
        this.cli = new CliManager(this._gameManager);
        this._logger = new RoomLogger(this.roomId);
        this._viewers = new Set<string>();

        this.setState(this._store.getState().gameState);
        this.listenForStateChange();
    }

    // Checks if a new client is allowed to join.
    requestJoin(options: JoinRoomOptions, isNew: boolean): boolean {
        this._logger.log(`User ${options.playerId ? options.playerId : options.clientId} wants to join the game as a ${options.isPlaying ? 'player': 'viewer'}.`);

        // If the user wants to play the game, check if the room is full.
        if(options.isPlaying) {
            // If the player was previously viewing the game, remove him from the list of viewers.
            if (this._viewers.has(options.clientId)) {
                this._viewers.delete(options.clientId);
            }

            const isRoomFull = this.hasReachedMaxClients() && !this.hasReservedSeat(options.sessionId);
            const isPlayerAlreadyInRoom = this.state.players[options.playerId] !== undefined;
            const doPlayerWantsToRejoin = this.state.hasStarted && isPlayerAlreadyInRoom && this.clients.findIndex(socket => socket.id === options.clientId) === -1;
            const canJoin = (!isRoomFull && !this.state.hasStarted && !isPlayerAlreadyInRoom) || doPlayerWantsToRejoin;

            if(this.state.hasStarted) {
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
            this._gameManager.addPlayer(client.id);
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
            this._logger.log("The client ", client.id, " has left the game.");
            this._gameManager.removePlayer(client.id);
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
        this._unsubscribeFromStore();
        this._gameManager.cleanUpResources();
        this.cli.cleanUpResources();
    }

    private listenForStateChange() {
        // Whenever the state changes, notify the players.
        this._unsubscribeFromStore = this._store.subscribe(() => {
            const state = this._store.getState();
            if(state.lastAction) {
                if(state.lastAction.type === fromState.GAME_STATE_CHANGED) {
                    // Do not override the this.state variable here. We can only mutate it
                    // has this is how colyseus handles state updates.
                    this.state.bombs = state.gameState.bombs;
                    this.state.gameId = state.gameState.gameId;
                    this.state.gameMap = state.gameState.gameMap;
                    this.state.hasStarted = state.gameState.hasStarted;
                    this.state.isOver = state.gameState.isOver;
                    this.state.paused = state.gameState.paused;
                    this.state.players = state.gameState.players;
                    this.state.time = state.gameState.time;
                    this.state.winner = state.gameState.winner;
                    this.state.collectibles = state.gameState.collectibles;

                    if(this.state.isOver) {
                        console.log("Game is over! Blocking all incoming actions.");
                        // Wait for clients to handle end of game properly, then close the room.
                        setTimeout(() => this.disconnect(), 2000);
                    }
                }
                else if(state.lastAction.type === fromState.GAME_IS_FULL) {
                    this._gameManager.startGame();
                }
            }
        });
    }
}
