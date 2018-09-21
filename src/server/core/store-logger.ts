import { Store, AnyAction } from 'redux';
import { GameAction } from 'dci-game-server';
import { PLANT_BOMB } from '../state';

export const loggerMiddleware = (store: Store) => (next: Function) => (action: GameAction) => {
    if(action.type === PLANT_BOMB) {
        console.log('[LOGGER] dispatching: ', action);
    }
    const result = next(action);
    // console.log('[LOGGER] next state: ', store.getState());
    return result;
}
