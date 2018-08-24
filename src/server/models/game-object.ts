import { Point } from "./point";

export enum ObjectType {
    Wall = "WALL",
    Walkable = "WALKABLE",
    BreakableItem = "BREAKABLE",
    Player = "PLAYER",
    Collectible = "COLLECTIBLE",
    Bomb = "BOMB"
}

export const OUT_OF_BOUND: GameObject = null;

/** Any object that can be displayed on the map has these properties. */
export class GameObject {
    type: ObjectType;
    coordinates: Point;
    width: number;
    height: number;
}

export class WalkableTerrain extends GameObject {
    type = ObjectType.Walkable;

    constructor(posInPixels: Point, width: number, height: number) {
        super();

        this.coordinates = posInPixels;
        this.width = width;
        this.height = height;
    }
}

export class Wall extends GameObject {
    type = ObjectType.Wall;

    constructor(posInPixels: Point, width: number, height: number) {
        super();
        
        this.coordinates = posInPixels;
        this.width = width;
        this.height = height;
    }
}

export class BreakableItem extends GameObject {
    type = ObjectType.BreakableItem;

    constructor(posInPixels: Point, width: number, height: number) {
        super();
        
        this.coordinates = posInPixels;
        this.width = width;
        this.height = height;
    }
}