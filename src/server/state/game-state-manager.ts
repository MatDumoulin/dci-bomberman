import { Subscription } from "rxjs";
import { Action, Store } from "dci-game-server";

import { GameState } from "./game-state.interface";
import * as fromActions from "./actions";
import { PlayerId, Player, Point, Bomb, OUT_OF_BOUND } from "../models";
import { GameEngine } from "../core/game-engine";

export class GameStateManager {
    private _store: Store<GameState, Action>;
    private _subscriptions: Subscription[] = [];

    constructor(store: Store<GameState, Action>) {
        this._store = store;
        this.listenOnStoreActions();
    }

    /**
     * This is the entry point for the actions coming from the users.
     * @param state The current state of the game.
     * @param action The user intent to change the state.
     */
    on(state: GameState, action: Action): void {
        let stateHasChanged = true;

        switch(action.type) {
            case fromActions.START_GAME: {
                // TODO: On game restart, reassign all players to their spawn.

                state.hasStarted = true;
                break;
            }
            case fromActions.PAUSE_GAME: {
                state.paused = true;
                break;
            }
            case fromActions.RESUME_GAME: {
                state.paused = false;
                break;
            }
            case fromActions.JOIN_GAME: {
                // First, we create a copy of the player map and add our player.
                const playerId: PlayerId = action.payload;
                this.addPlayerToGame(state, playerId);
                this._store.dispatch(fromActions.GameJoined.create(playerId));
                break;
            }
            case fromActions.UPDATE_MOVEMENT: {
                // First, we create a copy of the player map and update our player.
                let player = state.players[action.payload.playerId];
                player.actions = action.payload.actions;
                break;
            }
            case fromActions.UPDATE_ALL_POSITIONS: {
                const playerIds = Object.keys(state.players);
                // For each player,
                for (const playerId of playerIds) {
                    const player = state.players[playerId];
                    this.updatePlayerPosition(state, player);
                }
                break;
            }
            case fromActions.PLANT_BOMB: {
                const player = state.players[action.payload];

                if(player.bombs.length < player.maxBombCount) {
                    const bomb = new Bomb(player.playerId);
                    // Getting the coordinates of the bomb.
                    const centerOfPlayer = new Point(player.coordinates.x + player.width/2, player.coordinates.y + player.height/2);
                    const tile = state.gameMap.getTileFromPixels(centerOfPlayer.y, centerOfPlayer.x);

                    if(tile !== OUT_OF_BOUND) {
                        bomb.coordinates = new Point(tile.info.coordinates.x, tile.info.coordinates.y);
                        player.bombs.push(bomb);
                        // Then, we add the bomb to that tile.
                        tile.bombs.push(bomb);
                        this._store.dispatch(fromActions.BombPlanted.create(bomb));
                    }
                    else {
                        this._store.dispatch(fromActions.CannotPlantBomb.create(player.playerId));
                    }
                }
                else {
                    this._store.dispatch(fromActions.CannotPlantBomb.create(player.playerId));
                }

                break;
            }
            default: {
                stateHasChanged = false;
            }
        }

        if(stateHasChanged) {
            this._store.dispatch(fromActions.GameStateChanged.create(state));
        }
    }

    private addPlayerToGame(state: GameState, playerId: PlayerId): void {
        const currentNumberOfPlayer = Object.keys(state.players).length + 1;
        let newPlayer = new Player(playerId, currentNumberOfPlayer);
        const spawns = state.gameMap.getSpawns();
        this.setPlayerPositionToSpawn(newPlayer, spawns);

        // Then, we add the new player to the game.
        state.players[playerId] = newPlayer;
    }

   /**
    * Sets the position of the player to the given spawn.
    */
   private setPlayerPositionToSpawn(player: Player, spawns: Point[]): void {
       // If there are more players than spawns, throw an error.
       if(spawns.length < player.joinOrder) {
           throw new Error(`There are too many players for the map. The map allows ${spawns.length} but a player with joinOrder ${player.joinOrder} was able to join.`);
       }

       // Working with a copy of the spawn since it will become the new position of the player
       // and we will have to update its value when he moves.
       const spawn = spawns[player.joinOrder - 1];
       const spawnCopy = new Point(spawn.x, spawn.y);
       // Setting the player's position to the spawn.
       player.coordinates = spawnCopy;
   }

   /**
     * Returns a copy of the players with their positions set to the
     * spawning points of the map. This function is a pure function.
     * @param state The current state of the game.
     */
    private updatePlayerPosition(state: GameState, player: Player): Player {
        const move = {x: 0, y: 0};
        // First, we convert the move to numeric values.
        if(player.actions.move_up) {
            move.y = -1;
        }
        else if(player.actions.move_down) {
            move.y = 1;
        }
        else if(player.actions.move_left) {
            move.x = -1;
        }
        else if(player.actions.move_right) {
            move.x = 1;
        }
        // If the player is not moving, return the unchanged player.
        else {
            return player;
        }

        // Then, we compute the new position of the player (if no collision).
        const left = player.coordinates.x + player.speed * move.x;
        const top = player.coordinates.y + player.speed * move.y;

        const desiredNewPosition = new Point(left, top);
        GameEngine.movePlayerTo(state, player, desiredNewPosition);
    }

    private listenOnStoreActions(): void {
        this._subscriptions.push(
            this._store.getActions().subscribe(action => {
                const state = this._store.getCurrentState();
                this.on(state, action);
            })
        );
    }
}
