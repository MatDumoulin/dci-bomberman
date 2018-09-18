import { Store, AnyAction } from 'redux';
import { GameAction } from 'dci-game-server';

export const loggerMiddleware = (store: Store) => (next: Function) => (action: GameAction) => {
    console.log('[LOGGER] dispatching: ', action);
    const result = next(action);
    // console.log('[LOGGER] next state: ', store.getState());
    return result;
}
