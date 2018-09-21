import { Store, AnyAction } from 'redux';
import { GameAction } from 'dci-game-server';
import { PLANT_BOMB, PLANT_BOMB_IMPOSSIBLE, BOMB_PLANTED } from '../state';

export const loggerMiddleware = (store: Store) => (next: Function) => (action: GameAction) => {
    if(action.type === PLANT_BOMB || action.type === PLANT_BOMB_IMPOSSIBLE || action.type === BOMB_PLANTED) {
        console.log('[LOGGER] dispatching: ', action);
    }
    const result = next(action);
    // console.log('[LOGGER] next state: ', store.getState());
    return result;
}
