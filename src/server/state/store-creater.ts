import { createEpicMiddleware } from 'redux-observable';
/* import { loggerMiddleware } from '../core/store-logger'; */


/* import * as fromEffects from "./effects"; */
import * as fromReducers from "./reducers";
import * as fromServer from 'dci-game-server';
import { Store, Action } from 'dci-game-server';
import { defaultGameState } from './default-state/default-game-state';
import { GameStateManager } from './game-state-manager';
import { GameState } from './game-state.interface';
import { tap } from 'rxjs/operators';
import { loggerMiddleware } from '../core/store-logger';

/* export function createStore(): fromServer.GameState<fromReducers.GameState> {
    // First up, we get the effect middleware.
    const effectsMiddleware = createEpicMiddleware();
    // Then, create the store.
    const gameStateManager = new fromServer.GameState<fromReducers.GameState>(fromReducers.gameStateReducer, loggerMiddleware, effectsMiddleware);
    // Once the store is created, we need to apply our effects to our effect middleware
    effectsMiddleware.run(fromEffects.effects)

    return gameStateManager;
} */

export function createStore(): Store<GameState, Action> {
    /* // First up, we get the effect middleware.
    const effectsMiddleware = createEpicMiddleware();
    // Then, create the store.
    const gameStateManager = new fromServer.GameState<fromReducers.GameState>(fromReducers.gameStateReducer, loggerMiddleware, effectsMiddleware);
    // Once the store is created, we need to apply our effects to our effect middleware
    effectsMiddleware.run(fromEffects.effects) */

    const store = new Store<GameState, Action>(defaultGameState);

    store.getActions().subscribe(action => loggerMiddleware(action));


    return store;
}
