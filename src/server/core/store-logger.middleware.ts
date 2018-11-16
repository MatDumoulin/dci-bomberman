import { Store } from 'redux';
import { GameAction } from 'dci-game-server';
import { StoreLogger } from './loggers';


export class StoreLoggerMiddleware {
    logger: StoreLogger;

    constructor(roomId: string) {
        this.logger = new StoreLogger(roomId);
    }

    loggerMiddleware = (store: Store) => (next: Function) => (action: GameAction) => {
        this.logger.log('dispatching:', action);
        const result = next(action);
        // this.logger.log('next state:', store.getState()); // Create really big log files.
        return result;
    }
}
