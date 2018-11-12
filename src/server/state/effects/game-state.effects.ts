import { ActionsObservable, combineEpics, ofType, StateObservable } from "redux-observable";
import { tap, withLatestFrom, mapTo, map, filter } from 'rxjs/operators';
import { GameAction } from "dci-game-server";

import * as fromActions from "../actions";
import { GameState } from "../reducers";
import { of } from "rxjs";

const startGameEffect = (action$: ActionsObservable<GameAction>, state$: StateObservable<any>) => action$.pipe(
    ofType(fromActions.START_GAME),
    withLatestFrom(state$),
    mapTo(fromActions.GameStarted.create())
);

const joinGameEffect = (action$: ActionsObservable<GameAction>) => action$.pipe(
    ofType(fromActions.JOIN_GAME),
    mapTo(fromActions.GameJoined.create())
);

const plantBombEffect = (action$: ActionsObservable<GameAction>, state$: StateObservable<any>) => action$.pipe(
    ofType(fromActions.PLANT_BOMB),
    withLatestFrom(state$.pipe(map(state => state.gameState as GameState))),
    map(([action, state]) => {
        const playerId = action.payload;
        const player = state.players[playerId];

        if(!player || player.bombs.length >= player.maxBombCount) {
            return fromActions.PlantBombFailed.create(playerId);
        }
        else {
            return fromActions.BombPlanted.create(playerId);
        }
    })
);

const stateChangedEffect = (action$: ActionsObservable<GameAction>, state$: StateObservable<any>) => action$.pipe(
    ofType(
        fromActions.PAUSE_GAME,
        fromActions.RESUME_GAME,
        fromActions.GAME_JOINED,
        fromActions.GAME_STARTED,
        fromActions.GAME_TICK,
        fromActions.UPDATE_MOVEMENT,
        fromActions.BOMB_PLANTED,
        fromActions.BOMB_EXPLODED,
        fromActions.PLAYER_DAMAGED,
        fromActions.PLAYER_DIED
    ),
    mapTo(fromActions.GameStateChanged.create())
);

export const effects = combineEpics(
    startGameEffect, 
    joinGameEffect,  
    plantBombEffect, 
    stateChangedEffect
);
