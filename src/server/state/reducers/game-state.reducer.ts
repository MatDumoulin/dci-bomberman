import { Bomb, GameMap, Player, PlayerId, PlayerAction } from "../../models";
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
    isOver: ConstrainBoolean;
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
            const updatedPlayers = {
                ...state.players,
                [action.payload]: new PlayerAction()
            };
            // Then, we reflect the changes to our state.
            return {
                ...state,
                players: updatedPlayers
            };
        }
        case fromActions.UPDATE_MOVEMENT: {
            // First, we create a copy of the player map and update our player.
            const updatedPlayers = {
                ...state.players,
                [action.payload.playerId]: action.payload.actions
            };
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
