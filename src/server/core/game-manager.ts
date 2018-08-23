/**
 * This class manages the game loop as well as to restart and pause the game.
 */
export class GameManager {
    private _isGameRunning = false;

    constructor() {

    }

    /**
     * This function starts the game loop. In order for it to run properly,
     * there must be the proper number of players, which is between 2 and 4
     * for the bomberman game.
     */
    startGame(): void {

        this._isGameRunning = true;
    }

    /**
     * Stops and quits the game loop.
     */
    stopGame(): void {
        if(this._isGameRunning) {

        }
        else {
            console.error("Cannot stop the game since none is running currently.");
        }
    }

    /**
     * Pauses the game loop and sends 
     */
    pauseGame(): void {
        
    }
}