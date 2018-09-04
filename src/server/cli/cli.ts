import { GameManager } from "../core";

import { createInterface, ReadLine} from 'readline';

export class CliManager {
    private _commandLine: ReadLine;

    constructor(gameManager: GameManager) {
        this._commandLine = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log("Welcome to the dci-bomberman game.");
        console.log("Enter 'pause' to pause the game.");
        console.log("Enter 'start' to start the game. If there are 4 player, the game will automatically start.");

        this._commandLine.on("line", (line) => {
            if(line === "pause") {
                gameManager.pauseGame();
                console.log("Game is paused. Press 'resume' to resume.");
            }
            else if(line === "resume") {
                gameManager.resumeGame();
                console.log("Game is resumed.");
            }
            else if(line === "start") {
                gameManager.startGame();
            }
        });
    }

    cleanUpResources(): void {
        this._commandLine.close();
    }
}