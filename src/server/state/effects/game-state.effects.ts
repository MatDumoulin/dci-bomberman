/* import { ActionsObservable, combineEpics, ofType, StateObservable, Epic } from "redux-observable";
import { tap, withLatestFrom, mapTo, map } from 'rxjs/operators';
import { GameAction } from "dci-game-server";

import * as fromActions from "../actions";
import { BombermanSocketServer } from "../../comm";
import { GameState } from "../reducers";
import { Bomb, Point, OUT_OF_BOUND } from "../../models";

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

const plantBombEffect = (action$: ActionsObservable<GameAction>, state$: StateObservable<GameState>) => action$.pipe(
    ofType(fromActions.PLANT_BOMB),
    withLatestFrom(state$),
    map(([action, state]) =>  {
        const playerId = action.payload;
        const player = state.players[playerId];

        // If the player has bombs left in his inventory
        if(player.bombs.length < player.maxBombCount) {
            const bomb = new Bomb(player.playerId);
            // Getting the coordinates of the bomb.
            const centerOfPlayer = new Point(player.coordinates.x + player.width/2, player.coordinates.y + player.height/2);
            const tile = state.gameMap.getTileFromPixels(centerOfPlayer.y, centerOfPlayer.x);

            if(tile !== OUT_OF_BOUND) {
                bomb.coordinates = new Point(tile.info.coordinates.x, tile.info.coordinates.y);
                player.bombs.push(bomb);
                return fromActions.BombPlanted.create(bomb);
            }
        }

        return fromActions.CannotPlantBomb.create(playerId);
    })
);

const stateChangedEffect = (action$: ActionsObservable<GameAction>, state$: StateObservable<any>) => action$.pipe(
    ofType(
        fromActions.PAUSE_GAME,
        fromActions.RESUME_GAME,
        fromActions.GAME_JOINED,
        fromActions.UPDATE_MOVEMENT,
        fromActions.UPDATE_ALL_POSITIONS,
        fromActions.BOMB_PLANTED,
        fromActions.BOMB_EXPLODED,
        fromActions.PLAYER_DAMAGED,
        fromActions.PLAYER_DIED
    ),
    withLatestFrom(state$),
    tap(([action, state]) => BombermanSocketServer.getInstance().notifyGameStateChanged(state)),
    mapTo(fromActions.GameStateChanged.create())
);

export const effects = combineEpics(startGameEffect, joinGameEffect, plantBombEffect, stateChangedEffect);
 */
