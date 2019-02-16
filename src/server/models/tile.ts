import { GameObject } from "./game-object";
import { Bomb } from "./bomb";
import { Upgrade } from "./upgrade";

export class Tile {
    info: GameObject;
    bombs: Bomb[] = [];
    isOnFire = false;
    timeOfEndOfFire: number;
    collectible: Upgrade = null;

    constructor(info: GameObject) {
        this.info = info;
    }
}

export const OUT_OF_BOUND: Tile = null;
