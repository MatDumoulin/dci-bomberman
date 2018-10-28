import { Store, AnyAction } from 'redux';
import { Action } from 'dci-game-server';
import { PLANT_BOMB, PLANT_BOMB_IMPOSSIBLE, BOMB_PLANTED } from '../state';

export const loggerMiddleware = (action: Action) => {
    // if(action.type === PLANT_BOMB || action.type === PLANT_BOMB_IMPOSSIBLE || action.type === BOMB_PLANTED) {
        console.log('[LOGGER] dispatching: ', action);
    // }
}

