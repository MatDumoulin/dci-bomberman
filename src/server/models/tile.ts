import { GameObject } from "./game-object";
import { Bomb } from "./bomb";
import { Upgrade } from "./upgrade";

export class Tile {
    info: GameObject;
    row: number;
    col: number;
    bombs: Bomb[] = [];
    isOnFire = false;
    timeOfEndOfFire: number;
    collectible: Upgrade = null;

    constructor(info: GameObject, row: number, col: number) {
        this.info = info;
        this.row = row;
        this.col = col;
    }
}

export const OUT_OF_BOUND: Tile = null;
