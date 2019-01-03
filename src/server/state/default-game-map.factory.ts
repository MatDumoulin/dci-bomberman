import { GameMap } from "../models";
import * as MapDescriptor from "./default-map";
import { GameMapImpl } from "./game-map";

export function createDefaultGameMap(): GameMap {
    const gameMap = new GameMapImpl();
    gameMap.initFromMapDescriptor(MapDescriptor.defaultMap);

    return gameMap;
}
