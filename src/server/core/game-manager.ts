import * as fromState from "../state";
import * as fromServer from 'dci-game-server';
import { Unsubscribe } from "redux";
import { createStore } from "../state/store-creater";
import { PlayerActionWrapper, PlayerId } from "../models";
const gameloop = require('node-gameloop');

/**
 * This class manages the game loop as well as to restart and pause the game.
 */
export class GameManager {
    private readonly FPS = 30;
    private _isGameRunning = false;
    private _gameLoopId: number = null;
    private _currentGameState: fromState.GameState;
    private _gameStateManager: fromServer.GameState<fromState.GameState>;
    private _unsubscribeFromStore: Unsubscribe;

    constructor() {
        // Initializes the store
        this._gameStateManager = createStore();
        // And retrieves the state whenever it changes.
        this._unsubscribeFromStore = this._gameStateManager.subscribe(() => {
            this._currentGameState = this._gameStateManager.getState();
        });

        this._currentGameState = this._gameStateManager.getState();
    }

    cleanUpResources(): void {
        this._unsubscribeFromStore();
    }





    /**
     * This function starts the game loop. In order for it to run properly,
     * there must be the proper number of players, which is between 2 and 4
     * for the bomberman game.
     */
    startGame(): void {
        this._isGameRunning = true;

        this._gameLoopId = gameloop.setGameLoop( () => this.gameIteration(), 1000/this.FPS);
        this._gameStateManager.dispatch(fromState.StartGame.create());
    }

    /**
     * Stops and quits the game loop.
     */
    stopGame(): void {
        if(this._isGameRunning) {
            gameloop.clearGameLoop(this._gameLoopId);
            this._gameLoopId = null;
            this._isGameRunning = false;
        }
        else {
            console.error("Cannot stop the game since none is running currently.");
        }
    }

    /**
     * Pauses the game loop and notifies the players
     */
    pauseGame(): void {
        if(!this._currentGameState.paused) {
            this._gameStateManager.dispatch(fromState.PauseGame.create());
        }
    }

    /**
     * Resumes the game loop and notifies the players
     */
    resumeGame(): void {
        if(this._currentGameState.paused) {
            this._gameStateManager.dispatch(fromState.ResumeGame.create());
        }
    }

    addPlayer(playerId: PlayerId) {
        this._gameStateManager.dispatch(fromState.JoinGame.create(playerId));
    }

    updatePlayerActions(playerActionWrapper: PlayerActionWrapper): void {
        console.log("Player action changed: ", playerActionWrapper);
        this._gameStateManager.dispatch(fromState.UpdateMouvement.create(playerActionWrapper));
    }

    getGameState(): fromState.GameState {
        return this._currentGameState;
    }

    /**
     * This function is called at each game loop iteration
     */
    private gameIteration() {
        if(this._currentGameState.paused) {
            // Do nothing since the game is paused.
            return;
        }

        // Update the position of the players
        this._gameStateManager.dispatch(fromState.UpdateAllPositions.create());
        // Then, check if the player wants to plant a bomb.
        this.checkForPlayersToPlantBombs();
    }

    private checkForPlayersToPlantBombs() {
        const playerIds = Object.keys(this._currentGameState.players);
        for (const playerId of playerIds) {
            const player = this._currentGameState.players[playerId];

            if (player.actions.plant_bomb) {
                this._gameStateManager.dispatch(fromState.PlantBomb.create(playerId));
            }
        }
    }
}
