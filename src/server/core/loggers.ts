import { Logger } from '../../core';

export class RoomLogger extends Logger {
    constructor(roomId: string, logFileName: string) {
        super(`[ROOM ${roomId}]`, logFileName, '/logs/server/');
    }
}

export class StoreLogger extends Logger {
    constructor(logFileName: string) {
        super("[STORE]", logFileName, '/logs/server/');
    }
}
