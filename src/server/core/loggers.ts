import * as fs from "fs";

export class Logger {
    private _prefix: string;
    private _destination: fs.WriteStream;

    /**
     * @param prefix The identifier for the logs from this logger.
     * @param logFileName The file where we want to log. If null, use console.log() instead.
     */
    constructor(prefix: string, logFileName?: string) {
        this._prefix = prefix;

        if(logFileName) {
            // Since we are working from a bundle, to get the path of the logs folder, we need to change our __dirname
            const decomposedDirName = __dirname.split("\\");
            const projectRootPath = decomposedDirName.slice(0, -3).join("/");
            const fileLocation = projectRootPath + '/logs/server/' + logFileName + ".log";

            console.log(this._prefix, `Logging up in file: "${fileLocation}"`);
            this._destination = fs.createWriteStream(fileLocation, {flags : 'w'});

            this.listenForDestinationErrors();
        }
    }

    log(...messages: any[]): void {
        const message = `${this._prefix} ${messages.map(m => JSON.stringify(m)).join(' ')}`;

        if(this._destination) {
            this._destination.write(message + " \n");
        }
        else {
            console.log(message);
        }
    }

    private listenForDestinationErrors(): void {
        this._destination.on("error", (err) => {
            console.error(this._prefix, "An error occurred with the write stream. Check if the file exists.", err);
        });
    }
}

export class RoomLogger extends Logger {
    constructor(roomId: string, logFileName: string) {
        super(`[ROOM ${roomId}]`, logFileName);
    }
}

export class StoreLogger extends Logger {
    constructor(logFileName: string) {
        super("[STORE]", logFileName);
    }
}
