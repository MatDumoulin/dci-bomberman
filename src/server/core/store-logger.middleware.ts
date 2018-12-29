import { Store } from 'redux';
import { GameAction } from 'dci-game-server';
import { StoreLogger } from './loggers';


export class StoreLoggerMiddleware {
    logger: StoreLogger;

    constructor(roomId: string) {
        const currentTime = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        this.logger = new StoreLogger(currentTime);
        this.logger.log('THESE ARE THE LOGS FROM ROOM ID:', roomId);
    }

    loggerMiddleware = (store: Store) => (next: Function) => (action: GameAction) => {
        this.logger.log('dispatching:', action);
        const result = next(action);
        // this.logger.log('next state:', store.getState()); // It creates really big log files.
        return result;
    }
}
