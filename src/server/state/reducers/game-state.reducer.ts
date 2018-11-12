import { Bomb, GameMap, Player, PlayerId, PlayerAction, Point, Tile, ObjectType, OUT_OF_BOUND } from "../../models";
import * as MapDescriptor from "./default-map";
import { GameAction } from "dci-game-server";
import * as fromActions from "../actions";
import { GameEngine } from "../../core/game-engine";
import { ExplosionInformation } from "../../models/explosion-information";
import { stat } from "fs";

export interface GameState {
    gameId: string;
    gameMap: GameMap;
    players: { [id: string]: Player };
    bombs: { [id: string]: Bomb };
    // collectibles: Collectible[];
    paused: boolean;
    isOver: boolean;
    hasStarted: boolean;
    time: number;
    winner: PlayerId;
}

function createDefaultGameMap(): GameMap {
    const gameMap = new GameMap();
    gameMap.initFromMapDescriptor(MapDescriptor.defaultMap);

    return gameMap;
}

export const defaultGameState: GameState = {
    gameId: "1", // TODO: Get the id from a uuid generator
    gameMap: createDefaultGameMap(),
    players: {},
    bombs: {},
    // collectibles: []
    paused: false,
    isOver: false,
    hasStarted: false,
    time: 0,
    winner: null
};

export function gameStateReducer(state = defaultGameState, action: GameAction) {
    switch (action.type) {
        case fromActions.START_GAME: {
            // Set the position of all players to their spawn.
            // const players = setPlayersPositionToSpawn(state);

            // If there is only one player in the game, he has won.
            const playerIds = Object.keys(state.players);
            const winner = playerIds.length === 1 ? playerIds[0] : null;
            return {
                ...state,
                hasStarted: true,
                winner: winner,
                isOver: winner !== null
            };
        }
        case fromActions.PAUSE_GAME: {
            return {
                ...state,
                paused: true
            };
        }
        case fromActions.RESUME_GAME: {
            return {
                ...state,
                paused: false
            };
        }
        case fromActions.JOIN_GAME: {
            // First, we create a copy of the player map and add our player.
            const playerId: PlayerId = action.payload;
            const currentNumberOfPlayer = Object.keys(state.players).length + 1;
            let newPlayer = new Player(playerId, currentNumberOfPlayer);
            newPlayer = setPlayerPositionToSpawn(state, newPlayer);

            const updatedPlayers = {
                ...state.players,
                [playerId]: newPlayer
            };

            // Then, we reflect the changes to our state.
            return {
                ...state,
                players: updatedPlayers
            };
        }
        case fromActions.LEAVE_GAME: {
            const playerId: PlayerId = action.payload;
            // We remove the player from the list of players.
            const {[playerId]: playerThatLeft, ...remainingPlayers} = state.players;

            let winner: PlayerId = null;
            if(state.hasStarted) {
                const remainingPlayersIds = Object.keys(remainingPlayers);
                winner = remainingPlayersIds.length === 1 ? remainingPlayersIds[0] : null;
            }

            return {
                ...state,
                players: remainingPlayers,
                winner,
                isOver: winner !== null
            };
        }
        case fromActions.UPDATE_MOVEMENT: {
            // First, we create a copy of the player map and update our player.
            let player = state.players[action.payload.playerId];

            const updatedPlayers = {
                ...state.players,
                // For our player, replace its actions by the new actions.
                [action.payload.playerId]: { ...player, actions: action.payload.actions }
            };

            // Then, we reflect the changes to our state.
            return {
                ...state,
                players: updatedPlayers
            };
        }
        case fromActions.GAME_TICK: {
            // For each tile on fire, check if the explosion is over.
            const updatedMap = state.gameMap.immutableBatchSet(
                (tile: Tile, row: number, col: number) => {
                    if(tile.isOnFire && tile.timeOfEndOfFire < state.time ) {
                        return true; // Does not matter since we are not using it.
                    }

                    return null;
                },
                (tile: Tile, notImportant: boolean) => {
                    return {
                        ...tile, 
                        isOnFire: false
                    };
                }
            );

            // Then, for each player, update their position and check if they walk on
            // something that would change their state.
            const playerIds = Object.keys(state.players);
            const updatedPlayers: { [id: string]: Player } = {...state.players};
            let tilesOfPlayer: Tile[];
            let updatedWinner = state.winner;
            
            for (const playerId of playerIds) {
                const player = state.players[playerId];
                // Only move the player if he's alive.
                if(player.isAlive) {
                    updatedPlayers[playerId] = updatePlayerPosition(state, player);
                    // We get all the tiles that the player is on currently.
                    tilesOfPlayer = state.gameMap.getAllTilesInRange(
                        updatedPlayers[playerId].coordinates.y, 
                        updatedPlayers[playerId].coordinates.x, 
                        updatedPlayers[playerId].coordinates.y + updatedPlayers[playerId].height, 
                        updatedPlayers[playerId].coordinates.x + updatedPlayers[playerId].width);
                    
                    // From this list, we search for player kill. 
                    if(tilesOfPlayer.some(tile => tile.isOnFire)) {
                        updatedPlayers[playerId] = {
                            ...updatedPlayers[playerId],
                            isAlive: false
                        };

                        // If there is only one player left, he has won.
                        const alivePlayers: PlayerId[] = [];
                        for (const idOfPlayer of playerIds) {
                            if(updatedPlayers[playerId].isAlive) {
                                alivePlayers.push(idOfPlayer);
                            }
                        }

                        if(alivePlayers.length === 1) {
                            updatedWinner = alivePlayers[0];
                        }
                    }
                }
            }


            // Then, we reflect the changes to our state.
            return {
                ...state,
                players: updatedPlayers,
                gameMap: updatedMap,
                time: action.payload,
                winner: updatedWinner,
                isOver: updatedWinner !== null
            };
        }
        case fromActions.BOMB_PLANTED: {
            const playerId = action.payload;
            const player = state.players[playerId];
            // Use the center of the player to determine where the bomb should be planted.
            const tileRow = state.gameMap.getRowFromPixels(player.coordinates.y + (player.height / 2));
            const tileCol = state.gameMap.getColFromPixels(player.coordinates.x + (player.width / 2));

            const bomb = new Bomb(playerId, state.time, player.bombPower, tileRow, tileCol);
            
            // Adding the bomb to the player.
            const updatedPlayers = {
                ...state.players,
                [playerId]: {
                    ...player,
                    bombs: [...player.bombs, bomb]
                }
            };

            // Adding the bomb to the map.
            const updatedMap = state.gameMap.immutableSet(tileRow, tileCol, (tile: Tile) => {
                return {
                    ...tile,
                    bombs: [...tile.bombs, bomb]
                }
            });

            const updatedBombs = { 
                ...state.bombs, 
                [bomb.id]: bomb
            };

            return {
                ...state,
                players: updatedPlayers,
                gameMap: updatedMap,
                bombs: updatedBombs
            };
        }
        case fromActions.BOMB_EXPLODED: {
            const bomb = action.payload as Bomb;
            // We first get the effect of the explosion on the map. At the same time,
            // it provides us the list of cells that are now contained in the explosion.
            const affectedCells = getExplosionImpactOnMap(state.gameMap, bomb, state.time);

            // From this list, we get the updated map.
            let updatedMap = state.gameMap.immutableBatchSet(
                (tile: Tile, row: number, col: number) => {
                    const searchResult = affectedCells.find(affected => affected.row === row && affected.col === col);

                    if(searchResult !== undefined) {
                        return searchResult.after;
                    }

                    return null;
                },
                (tile: Tile, after: Partial<Tile>) => Object.assign({}, tile, after)
            );

            // Then, we remove the bomb from the player that planted it.
            const updatedPlayers: { [id: string]: Player } = {
                ...state.players,
                [bomb.plantedBy]: {
                    ...state.players[bomb.plantedBy],
                    bombs: state.players[bomb.plantedBy].bombs.filter(bombOfPlayer => bombOfPlayer.id !== bomb.id)
                }
            };

            // We let a grace period of one game tick to the players to check if there are killed by the explosion.


            // Finally, we remove the bomb from the list of bombs.
            const {[bomb.id]:explodedBomb, ...updatedBombs} = state.bombs;


            return {
                ...state,
                players: updatedPlayers,
                gameMap: updatedMap,
                bombs: updatedBombs
            };
        }

        default:
            return state;
    }
}

/**
 * Returns a copy of the players with their positions set to the
 * spawning points of the map. This function is a pure function.
 * @param state The current state of the game.
 */
/* function setPlayersPositionToSpawn(state: GameState): { [id: string]: Player } {
    let players: { [id: string]: Player } = {};
    let playerIds: PlayerId[] = Object.keys(state.players);
    const spawns = state.gameMap.getSpawns();

    // If there are more players than spawns, throw an error.
    if(spawns.length < playerIds.length) {
        throw new Error(`There are too many players for the map. The map allows ${spawns.length} but there are ${playerIds.length} players`);
    }

    for (let i = 0; i < playerIds.length; ++i) {
        let player = state.players[playerIds[i]];
        // Working with a copy of the spawn since it will become the new position of the player.
        const spawn = Object.assign({}, spawns[i]);
        // Setting the player's position to the spawn.
        player = {...player, joinOrder: i, coordinates: spawn};
        players[player.playerId] = player;
    }

    return players;
} */


/**
 * Returns a copy of the players with their positions set to the
 * spawning points of the map. This function is a pure function.
 * @param state The current state of the game.
 */
function setPlayerPositionToSpawn(state: GameState, player: Player): Player {
    const spawns = state.gameMap.getSpawns();

    // If there are more players than spawns, throw an error.
    if(spawns.length < player.joinOrder) {
        throw new Error(`There are too many players for the map. The map allows ${spawns.length} but a player with joinOrder ${player.joinOrder} was able to join.`);
    }

    // Working with a copy of the spawn since it will become the new position of the player.
    const spawn = spawns[player.joinOrder - 1];
    // Setting the player's position to the spawn.
    const updatedPlayer = {...player, coordinates: spawn};

    return updatedPlayer;
}

/**
 * Updates the position of the player. This function is a pure function.
 * @param state The current state of the game.
 */
function updatePlayerPosition(state: GameState, player: Player): Player {
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
    return GameEngine.movePlayerTo(state, player, desiredNewPosition);
}

function getExplosionImpactOnMap(gameMap: GameMap, bomb: Bomb, currentTime: number): ExplosionInformation[] {
    const mapTransformation: ExplosionInformation[] = [];
    let tile;
    // First up, we check get all the tiles exposed to the explosion.
    for(const direction of GameEngine.Directions) {
        for(let i = 1; i <= bomb.bombPower; ++i) {
            const probedRow = bomb.row + direction[0];
            const probedCol = bomb.col + direction[1];
            tile = gameMap.get(probedRow, probedCol);

            // We set the tile on fire.
            const after: Partial<Tile> = {
                isOnFire: true,
                timeOfEndOfFire: currentTime + bomb.EXPLOSION_DURATION
            };

            // If the explosion is blocked by a wall,
            if(tile === OUT_OF_BOUND || tile.info.type === ObjectType.Wall) {
                // Quit this nested loop since the explosion has been stopped.
                break; 
            }
            // If the tile is breakable, set it to walkable now.
            else if(tile.info.type === ObjectType.BreakableItem) {
                after.info =  {
                    ...tile.info,
                    type: ObjectType.Walkable
                };

                mapTransformation.push(new ExplosionInformation(probedRow, probedCol, tile, after));
                // Quit this nested loop since the explosion has been stopped by the breakable item.
                break; 
            }
            else {
                mapTransformation.push(new ExplosionInformation(probedRow, probedCol, tile, after));
            }

            
        }
    }

    // Then, we remove the bomb from the map.
    tile = gameMap.get(bomb.row, bomb.col);
    const after: Partial<Tile> = {
        isOnFire: true,
        timeOfEndOfFire: currentTime + bomb.EXPLOSION_DURATION,
        bombs: tile.bombs.filter(bombInArray => bomb.id !== bombInArray.id)
    };

    mapTransformation.push(new ExplosionInformation(bomb.row, bomb.col, tile, after));

    return mapTransformation;
}
