import * as Timer from "@gamestdio/timer";
import * as fromState from "../state";
import * as fromServer from 'dci-game-server';
import { Unsubscribe, Store } from "redux";
import { PlayerActionWrapper, PlayerId } from "../models";
import { ProcessManager } from "./process-manager";

/**
 * This class manages the game loop as well as to restart and pause the game.
 */
export class GameManager {
    private readonly FPS = 60;
    private _currentGameState: fromState.GameState;
    private _store: Store<fromState.State, fromServer.GameAction>;
    private _unsubscribeFromStore: Unsubscribe;
    private _timer: Timer.default;
    private _gameloop: Timer.Delayed;
    private _maxPlayerCount: number;

    constructor(store: Store<fromState.State, fromServer.GameAction>, maxPlayerCount: number) {
        // Initializes the store
        this._store = store;
        this._maxPlayerCount = maxPlayerCount;
        // And retrieves the state whenever it changes.
        this._unsubscribeFromStore = this._store.subscribe(() => {
            this._currentGameState = this._store.getState().gameState;
        });

        this._store.dispatch(fromState.InitGame.create());
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
        this._timer = new Timer.default(true);

        this._gameloop = this._timer.setInterval(() => this.gameTick(), 0);

        this._store.dispatch(fromState.StartGame.create());
    }

    /**
     * Stops and quits the game loop.
     */
    stopGame(): void {
        if(this._gameloop && this._gameloop.active) {
            this._gameloop.clear();
        }
        else {
            console.error("Cannot stop the game since none is running currently.");
        }
    }

    /**
     * Pauses the game loop and notifies the players
     */
    pauseGame(): void {
        if(this._currentGameState.hasStarted && !this._currentGameState.paused) {
            this._store.dispatch(fromState.PauseGame.create());
            this._gameloop.pause();
        }
    }

    /**
     * Resumes the game loop and notifies the players
     */
    resumeGame(): void {
        if(this._currentGameState.hasStarted && this._currentGameState.paused) {
            this._store.dispatch(fromState.ResumeGame.create());
            this._gameloop.resume();
        }
    }

    fillGameWithBots(): void {
        const playerIds = Object.keys(this._currentGameState.players);
        // If the current game is not full
        if(playerIds.length < this._maxPlayerCount) {
            // Fill the game with bots.
            const missingPlayerCount = this._maxPlayerCount - playerIds.length;

            for(let i = 0; i < missingPlayerCount; ++i) {
                ProcessManager.spawnBot();
            }
        }
    }

    addPlayer(playerId: PlayerId) {
        this._store.dispatch(fromState.JoinGame.create(playerId));
    }

    removePlayer(playerId: PlayerId): void {
        // If the game is over, leave the state as is.
        if(this._currentGameState.isOver) {
            return;
        }

        this._store.dispatch(fromState.LeaveGame.create(playerId));

        if(this._currentGameState.hasStarted) {
            console.log("The player ", playerId, " has left the game.");
        }
    }

    updatePlayerActions(playerActionWrapper: PlayerActionWrapper): void {
        // Only update the actions of the player if the game has started, he's in the game and he is alive.
        if(this._currentGameState.hasStarted &&
            !this._currentGameState.isOver &&
            this._currentGameState.players[playerActionWrapper.playerId] !== undefined &&
            this._currentGameState.players[playerActionWrapper.playerId].isAlive) {

            this._store.dispatch(fromState.UpdateMouvement.create(playerActionWrapper));
        }
    }

    private gameTick() {
        // If there is a winner, stop the game.
        if(this._currentGameState.winner !== null || this._currentGameState.isOver) {
            this.stopGame();
            return;
        }
        // Do nothing since the game is paused.
        if(this._currentGameState.paused) {
            return;
        }

        // Check for plant bomb and player won
        const playerIds = Object.keys(this._currentGameState.players);

        for(const playerId of playerIds) {
            if(this._currentGameState.players[playerId].actions.plant_bomb) {
                this._store.dispatch(fromState.PlantBomb.create(playerId));
            }
        }

        this._store.dispatch(fromState.GameTick.create(this._gameloop.elapsedTime));

        const bombIds = Object.keys(this._currentGameState.bombs);
        // Look for exploding bombs.
        for(const bombId of bombIds) {
            const bomb = this._currentGameState.bombs[bombId];

            if(bomb.plantedAt + bomb.TIME_BEFORE_EXPLOSION <= this._currentGameState.time) {
                this._store.dispatch(fromState.BombExploded.create(bomb));
            }
        }

    }
}
