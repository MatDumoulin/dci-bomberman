import { GameManager } from "../core";

import { createInterface, ReadLine } from "readline";

export class CliManager {
    private _commandLine: ReadLine;

    constructor(gameManager: GameManager) {
        this._commandLine = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log("Welcome to the dci-bomberman game.");
        console.log("Enter 'pause' to pause the game.");
        console.log("Enter 'stop' to stop the game.");
        console.log(
            `Enter 'start' to start the game.`,
            `If there are 4 player, the game will automatically start.`,
            `The game will be filled with bots if it is not full when started.`
        );
        console.log();

        this._commandLine.on("line", line => {
            if (line === "pause") {
                gameManager.pauseGame();
                console.log("Game is paused. Press 'resume' to resume.");
            } else if (line === "resume") {
                gameManager.resumeGame();
                console.log("Game is resumed.");
            } else if (line === "start") {
                // The game automatically starts when it is full.
                // To manually start the game, we only have to fill in the game with bots.
                gameManager.fillGameWithBots();
            } else if (line === "stop") {
                gameManager.stopGame();
                this.cleanUpResources();
            }
        });
    }

    cleanUpResources(): void {
        this._commandLine.close();
    }
}
