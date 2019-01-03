import * as Timer from "@gamestdio/timer";
import * as fromState from "../state";
import { PlayerActionWrapper, PlayerId } from "../models";
import { ProcessManager } from "./process-manager";
import { GameState } from "../state";

/**
 * This class manages the game loop as well as to restart and pause the game.
 */
export class GameManager {
    private readonly FPS = 60;
    private _gameState: fromState.GameState;
    private _timer: Timer.default;
    private _gameloop: Timer.Delayed;
    private _maxPlayerCount: number;

    constructor(gameState: GameState, maxPlayerCount: number) {
        this._maxPlayerCount = maxPlayerCount;
        this._gameState = gameState;
    }

    /**
     * This function starts the game loop. In order for it to run properly,
     * there must be the proper number of players, which is between 2 and 4
     * for the bomberman game.
     */
    startGame(): void {
        this._timer = new Timer.default(true);

        this._gameloop = this._timer.setInterval(() => this.gameTick(), 0);

        this._gameState.startGame();
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
        if(this._gameState.hasStarted && !this._gameState.paused) {
            this._gameState.pauseGame();
            this._gameloop.pause();
        }
    }

    /**
     * Resumes the game loop and notifies the players
     */
    resumeGame(): void {
        if(this._gameState.hasStarted && this._gameState.paused) {
            this._gameState.resumeGame();
            this._gameloop.resume();
        }
    }

    fillGameWithBots(): void {
        const playerIds = Object.keys(this._gameState.players);
        // If the current game is not full
        if(playerIds.length < this._maxPlayerCount) {
            // Fill the game with bots.
            const missingPlayerCount = this._maxPlayerCount - playerIds.length;

            for(let i = 0; i < missingPlayerCount; ++i) {
                ProcessManager.spawnBot();
            }
        }
    }

    /**
     * @returns True if the player has successfully joined the game, false otherwise.
     */
    addPlayer(playerId: PlayerId): boolean {
        return this._gameState.joinGame(playerId);
    }

    removePlayer(playerId: PlayerId): void {
        // If the game is over, leave the state as is.
        if(this._gameState.isOver) {
            return;
        }

        this._gameState.leaveGame(playerId);
    }

    updatePlayerActions(playerActionWrapper: PlayerActionWrapper): void {
        // Only update the actions of the player if the game has started, he's in the game and he is alive.
        if(this._gameState.hasStarted &&
            !this._gameState.isOver &&
            this._gameState.players[playerActionWrapper.playerId] !== undefined &&
            this._gameState.players[playerActionWrapper.playerId].isAlive) {

            this._gameState.updateActionsOfPlayer(playerActionWrapper.playerId, playerActionWrapper.actions);
        }
    }

    private gameTick() {
        // If there is a winner, stop the game.
        if(this._gameState.winner !== null || this._gameState.isOver) {
            this.stopGame();
            return;
        }
        // Do nothing since the game is paused.
        if(this._gameState.paused) {
            return;
        }

        this._gameState.gameTick(this._gameloop.elapsedTime);
    }
}
