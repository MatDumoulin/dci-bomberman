import { GameMap } from "../../models";
import { GameState } from "../game-state.interface";
import * as MapDescriptor from "./default-map";

export const defaultGameState: GameState = {
    gameId: "1", // TODO: Get the id from a uuid generator
    gameMap: createDefaultGameMap(),
    players: {},
    // collectibles: []
    paused: false,
    isOver: false,
    hasStarted: false
};


function createDefaultGameMap(): GameMap {
    const gameMap = new GameMap();
    gameMap.initFromMapDescriptor(MapDescriptor.defaultMap);

    return gameMap;
}
