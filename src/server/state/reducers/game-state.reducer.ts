import { Bomb, GameMap, Player, PlayerId, PlayerAction, Point, OUT_OF_BOUND, ObjectType } from "../../models";
import * as MapDescriptor from "./default-map";
import { GameAction } from "dci-game-server";
import * as fromActions from "../actions";

export interface GameState {
    gameId: string;
    gameMap: GameMap;
    players: { [id: string]: Player };
    bombs: Bomb[];
    // collectibles: Collectible[];
    paused: boolean;
    isOver: boolean;
    hasStarted: boolean;
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
    bombs: [],
    // collectibles: []
    paused: false,
    isOver: false,
    hasStarted: false
};

export function gameStateReducer(state = defaultGameState, action: GameAction) {
    switch (action.type) {
        case fromActions.START_GAME: {
            // Set the position of all players to their spawn.
            // const players = setPlayersPositionToSpawn(state);

            return {
                ...state,
                hasStarted: true
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
        case fromActions.UPDATE_ALL_POSITIONS: {
            // First, we create a copy of the player map and update our players.
            const updatedPlayers: { [id: string]: Player } = {};
            const playerIds = Object.keys(state.players);

            for (const playerId of playerIds) {
                const player = state.players[playerId];
                const updatedPlayer = updatePlayerPosition(state, player);

                updatedPlayers[playerId] = updatedPlayer;
            }

            // Then, we reflect the changes to our state.
            return {
                ...state,
                players: updatedPlayers
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
function setPlayersPositionToSpawn(state: GameState): { [id: string]: Player } {
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
}


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
    const spawnCopy = new Point(spawn.x, spawn.y);
    // Setting the player's position to the spawn.
    const updatedPlayer = {...player, coordinates: spawnCopy};

    return updatedPlayer;
}


/**
 * Returns a copy of the players with their positions set to the
 * spawning points of the map. This function is a pure function.
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
    let left = player.coordinates.x + player.speed * move.x;
    let top = player.coordinates.y + player.speed * move.y;
    const bottom = top + player.height - 1; // -1 because the pixels are 0 based.
    const right = left + player.width - 1;

    // After that, we adjust the position to match the collisions.
    const topLeftTile = state.gameMap.getTileFromPixels(top, left);
    const topRightTile = state.gameMap.getTileFromPixels(top, right);
    const bottomLeftTile = state.gameMap.getTileFromPixels(bottom, left);
    const bottomRightTile = state.gameMap.getTileFromPixels(bottom, right);

/*     if(newTile === OUT_OF_BOUND) {
        if(newX < 0) {
            newX = 0;
        }
        else {
            const maxX = ( state.gameMap.getTileWidth() * state.gameMap.getWidth() ) - player.width;
            if(newX > maxX) {
                newX = maxX;
            }
        }

        if(newY < 0) {
            newY = 0;
        }
        else {
            const maxY = ( state.gameMap.getTileHeight() * state.gameMap.getHeight() ) - player.height;
            if(newY > maxY) {
                newY = maxY;
            }
        }
    }
    else if(newTile.type !== ObjectType.Walkable) {
        newX =
    } */

    if(topLeftTile === OUT_OF_BOUND || topLeftTile.type !== ObjectType.Walkable ||
        topRightTile === OUT_OF_BOUND || topRightTile.type !== ObjectType.Walkable ||
        bottomLeftTile === OUT_OF_BOUND || bottomLeftTile.type !== ObjectType.Walkable ||
        bottomRightTile === OUT_OF_BOUND || bottomRightTile.type !== ObjectType.Walkable) {
        left = player.coordinates.x;
        top = player.coordinates.y;
    }

    const newPosition = new Point(left, top);
    const updatedPlayer = {...player, coordinates: newPosition};

    return updatedPlayer;
}
