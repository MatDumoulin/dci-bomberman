import { Point } from "./point";

export enum ObjectType {
    Wall = "WALL",
    Walkable = "WALKABLE",
    BreakableItem = "BREAKABLE",
    Player = "PLAYER",
    Bomb = "BOMB",
    PowerUp = "POWER-UP",
    BombUp = "BOMB-UP",
    SpeedUp = "SPEED-UP"
}

/** Any object that can be displayed on the map has these properties. */
export class GameObject {
    type: ObjectType;
    coordinates: Point;
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}

export class WalkableTerrain extends GameObject {
    type = ObjectType.Walkable;

    constructor(posInPixels: Point, width: number, height: number) {
        super(width, height);

        this.coordinates = posInPixels;
    }
}

export class Wall extends GameObject {
    type = ObjectType.Wall;

    constructor(posInPixels: Point, width: number, height: number) {
        super(width, height);

        this.coordinates = posInPixels;
    }
}

export class BreakableItem extends GameObject {
    type = ObjectType.BreakableItem;

    constructor(posInPixels: Point, width: number, height: number) {
        super(width, height);

        this.coordinates = posInPixels;
    }
}
