import { PlayerState } from "../state/player-state";
import { GameState } from "../../server/state";
import { config } from "../config";
import { SocketClient } from "../comm/socket-client";
import { Subscription } from "rxjs";
import { PlayerAction } from "../../server/models";

const gameloop = require('node-gameloop');

/**
 * This class manages the game loop as well as to restart and pause the game.
 */
export class GameManager {
    private readonly FPS = 60;
    private _isGameRunning = false;
    private _gameLoopId: number = null;
    private _playerState: PlayerState;
    private _currentGameState: GameState;
    private _subscriptions: Subscription[] = [];

    private _iterationCounter: number;

    constructor() {
        this._playerState = new PlayerState(config.team_key);
    }

    joinGame() {
        this._playerState.isInGame = true;
    }

    /**
     * This function starts the game loop for the player.
     */
    startGame(gameState: GameState): void {
        console.log("Game state:", gameState);
        this._currentGameState = gameState;
        this._isGameRunning = true;
        this._iterationCounter = 0;
        // Start the game loop
        this._gameLoopId = gameloop.setGameLoop( () => this.gameIteration(), 1000/this.FPS);
        // Whenever the actions of the player change, notify the server.
        this._subscriptions.push(
            this._playerState.actions.getQueue().subscribe(newActions => {
                const playerId = this._playerState.playerId;
                SocketClient.getInstance().sendPlayerActions(playerId, newActions);
            })
        );
    }

    getPlayerState(): PlayerState {
        return this._playerState;
    }

    setGameState(gameState: GameState) {
        this._currentGameState = gameState;
    }

    /**
     * Stops and quits the game loop.
     */
    private stopGame(): void {
        if(this._isGameRunning) {
            gameloop.clearGameLoop(this._gameLoopId);
            this._gameLoopId = null;
            this._isGameRunning = false;

            for(const sub of this._subscriptions) {
                sub.unsubscribe();
            }

            this._subscriptions = [];
        }
    }

    /**
     * This function is called at each game loop iteration
     */
    private gameIteration(): void {
        // If game state is null, consider that the game has been stopped by the server.
        if(!this._currentGameState || (this._currentGameState.isOver && this._isGameRunning)) {
            // Stop the game loop and set the game to over
            this.stopGame();
            return;
        }

        if(this._currentGameState.paused) {
            // Do nothing since the game is paused.
            return;
        }

        this._iterationCounter++;
        const framesInASecond = 1000/this.FPS;
        if(this._iterationCounter >= framesInASecond) {
            this._iterationCounter = 0;
            this.setRandomMoves()
        }
    }

    private setRandomMoves(): void  {
        const randomNumber = Math.round(Math.random() * 5);
        console.log(randomNumber);

        const moves: PlayerAction = {
            move_up: false,
            move_down: false,
            move_left: false,
            move_right: false,
            plant_bomb: false
        }

        switch(randomNumber) {
            case 1: moves.move_up = true; break;
            case 2: moves.move_down = true; break;
            case 3: moves.move_left = true; break;
            case 4: moves.move_right = true; break;
            case 5: moves.plant_bomb = true; break;
        }

        this._playerState.actions.set(moves);
    }
}
