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
    cli: CliManager;
    maxPlayerCount = 4;

    // Authorize client based on provided options before WebSocket handshake is complete
    // onAuth (options: any) { }

    // When room is initialized
    onInit (options: any) {
        this._store = fromState.createStore(this.roomId);
        this._gameManager = new GameManager(this._store);
        this.cli = new CliManager(this._gameManager);
        this._logger = new RoomLogger(this.roomId);

        this.setState(this._store.getState().gameState);
        this.listenForStateChange();
    }

    // Checks if a new client is allowed to join.
    requestJoin(options: JoinRoomOptions, isNew: boolean): boolean {
        this._logger.log(`User ${options.clientId} wants to join the game as a ${options.isPlaying ? 'player': 'viewer'}.`);

        // If the user wants to play the game, check if the room is full.
        if(options.isPlaying) {
            const playerIds = Object.keys(this.state.players);

            const isRoomFull = playerIds.length < this.maxPlayerCount;
            const canJoin = isRoomFull && !this.state.hasStarted;

            if(this.state.hasStarted) {
                this._logger.log("The user cannot join since the game has already started.");
            }
            if(!isRoomFull) {
                this._logger.log("The user cannot join since the room is full.");
            }

            return canJoin;
        }

        // Else, let him join has a viewer.
        return true;
    }

    // When client successfully join the room
    onJoin (client: Client) {
        this._logger.log("The client ", client.id, " has joined the game.");
        this._gameManager.addPlayer(client.id);
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) {
        this._logger.log("The client ", client.id, " has left the game.");
        this._gameManager.removePlayer(client.id);
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
                }
            }
        });
    }
}
