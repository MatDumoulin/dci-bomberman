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
    /** Coordinates on the map */
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

    constructor(pos: Point, width: number, height: number) {
        super(width, height);

        this.coordinates = pos;
    }
}

export class Wall extends GameObject {
    type = ObjectType.Wall;

    constructor(pos: Point, width: number, height: number) {
        super(width, height);

        this.coordinates = pos;
    }
}

export class BreakableItem extends GameObject {
    type = ObjectType.BreakableItem;

    constructor(pos: Point, width: number, height: number) {
        super(width, height);

        this.coordinates = pos;
    }
}
