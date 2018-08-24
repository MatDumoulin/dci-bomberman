import { Bomb, GameMap, Player } from "../../models";
import * as MapDescriptor from "./default-map";
import { GameAction } from "dci-game-server";

export interface GameState {
    gameMap: GameMap;
    players: Player[];
    bombs: Bomb[];
    // collectibles: Collectible[];
    paused: boolean;
}

function createDefaultGameMap(): GameMap  {
    const gameMap = new GameMap();
    gameMap.initFromMapDescriptor(MapDescriptor.defaultMap);

    return gameMap;
}

export const defaultGameState: GameState = {
    gameMap: createDefaultGameMap(),
    players: [],
    bombs: [],
    // collectibles: []
    paused: false
}


export function gameStateReducer(state = defaultGameState, action: GameAction) {
    switch(action.type) {
        default : return state;
    }
}