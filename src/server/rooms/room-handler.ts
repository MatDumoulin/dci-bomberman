import { Room, Client } from "colyseus";
import { Unsubscribe, Store } from "redux";

import { CliManager } from "../cli/cli";
import { GameManager } from "../core";
import { Message } from "../comm";

import * as fromState from "../state";
import * as fromServer from 'dci-game-server';

/**
 * This class handles all of the communication with the user.
 */
export class RoomHandler extends Room<fromState.GameState> {
    private _gameManager: GameManager;
    private _store: Store<fromState.State, fromServer.GameAction>;
    private _unsubscribeFromStore: Unsubscribe;
    cli: CliManager;
    maxClients = 4;

    // Authorize client based on provided options before WebSocket handshake is complete
    // onAuth (options: any) { }

    // When room is initialized
    onInit (options: any) {
        this._store = fromState.createStore();
        this._gameManager = new GameManager(this._store);
        this.cli = new CliManager(this._gameManager);

        this.setState(this._store.getState().gameState);
        this.listenForStateChange();
    }

    // Checks if a new client is allowed to join. (default: `return true`)
    //requestJoin (options: any, isNew: boolean) { }

    // When client successfully join the room
    onJoin (client: Client) {
        console.log("The client ", client.id, " has joined the game.");
        this._gameManager.addPlayer(client.id);
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) {
        console.log("The client ", client.id, " has left the game.");
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
        console.log("Cleaning up room...");
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
