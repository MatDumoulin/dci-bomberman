import { Server } from "colyseus";

import { createInterface, ReadLine } from "readline";

export class ServerCli {
    private _commandLine: ReadLine;

    constructor(gameServer: Server) {
        this._commandLine = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log("Welcome to the dci-bomberman game.");
        console.log("Enter 'quit' to quit the game.");
        console.log();

        this._commandLine.on("line", line => {
            if (line === "quit") {
                console.log("Cleaning up...");
                gameServer.gracefullyShutdown(true).then(() => {
                    this.cleanUpResources();
                    console.log("Clean up is done!");
                    process.exit();
                });
            }
        });
    }

    cleanUpResources(): void {
        this._commandLine.close();
    }
}
