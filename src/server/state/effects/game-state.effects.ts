import { ActionsObservable, combineEpics, ofType, StateObservable } from "redux-observable";
import { tap, withLatestFrom, mapTo } from 'rxjs/operators';
import { GameAction } from "dci-game-server";

import * as fromActions from "../actions";
import { BombermanSocketServer } from "../../comm";

const startGameEffect = (action$: ActionsObservable<GameAction>, state$: StateObservable<any>) => action$.pipe(
    ofType(fromActions.START_GAME),
    withLatestFrom(state$),
    tap(([action, state]) => BombermanSocketServer.getInstance().startGame(state)),
    mapTo(fromActions.GameStarted.create())
);

const joinGameEffect = (action$: ActionsObservable<GameAction>) => action$.pipe(
    ofType(fromActions.JOIN_GAME),
    tap(action => BombermanSocketServer.getInstance().notifyGameJoined(action.payload)),
    mapTo(fromActions.GameJoined.create())
);

const stateChangedEffect = (action$: ActionsObservable<GameAction>, state$: StateObservable<any>) => action$.pipe(
    ofType(
        fromActions.PAUSE_GAME,
        fromActions.RESUME_GAME,
        fromActions.UPDATE_MOVEMENT,
        fromActions.BOMB_PLANTED,
        fromActions.BOMB_EXPLODED,
        fromActions.PLAYER_DAMAGED,
        fromActions.PLAYER_DIED
    ),
    withLatestFrom(state$),
    tap(([action, state]) => BombermanSocketServer.getInstance().notifyGameStateChanged(state)),
    mapTo(fromActions.GameStateChanged.create())
);

export const effects = combineEpics(startGameEffect, joinGameEffect, stateChangedEffect);
