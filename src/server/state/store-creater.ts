import { createEpicMiddleware } from 'redux-observable';
import { loggerMiddleware } from '../core/store-logger';


import * as fromEffects from "./effects";
import * as fromReducers from "./reducers";
import * as fromServer from 'dci-game-server';

export function createStore(): fromServer.GameState<fromReducers.GameState> {
    // First up, we get the effect middleware.
    const effectsMiddleware = createEpicMiddleware();
    // Then, create the store.
    const gameStateManager = new fromServer.GameState<fromReducers.GameState>(fromReducers.gameStateReducer, loggerMiddleware, effectsMiddleware);
    // Once the store is created, we need to apply our effects to our effect middleware
    effectsMiddleware.run(fromEffects.effects)

    return gameStateManager;
}
