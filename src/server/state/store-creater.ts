import { createEpicMiddleware } from 'redux-observable';
import { loggerMiddleware } from '../core/store-logger';


import * as fromEffects from "./effects";
import * as fromReducers from "./reducers";
import { GameAction } from 'dci-game-server';
import { combineReducers, createStore as createReduxStore, applyMiddleware, Store} from 'redux';

export function createStore(): Store<fromReducers.State, GameAction> {
    // First up, we get the effect middleware.
    const effectsMiddleware = createEpicMiddleware();
    // Then, we create the store.
    const gameStateManager = createReduxStore(fromReducers.rootReducer, applyMiddleware(loggerMiddleware, effectsMiddleware));
    // Once the store is created, we need to apply our effects to our effect middleware
    effectsMiddleware.run(fromEffects.effects)

    return gameStateManager;
}
