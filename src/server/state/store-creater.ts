import { createEpicMiddleware } from 'redux-observable';
import { StoreLoggerMiddleware } from '../core/store-logger.middleware';

import * as fromEffects from "./effects";
import * as fromReducers from "./reducers";
import { GameAction } from 'dci-game-server';
import { createStore as createReduxStore, applyMiddleware, Store} from 'redux';

export function createStore(roomId: string): Store<fromReducers.State, GameAction> {
    const storeLogger = new StoreLoggerMiddleware(roomId);
    // First up, we get the effect middleware.
    const effectsMiddleware = createEpicMiddleware();
    // Then, we create the store.
    const gameStateManager = createReduxStore(fromReducers.rootReducer, applyMiddleware(storeLogger.loggerMiddleware, effectsMiddleware));
    // Once the store is created, we need to apply our effects to our effect middleware
    effectsMiddleware.run(fromEffects.effects)

    return gameStateManager;
}
