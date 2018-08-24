import { GameMap } from "./game-map";

/** A coordinate in 2D. It is agnostic of the map in which it is used. */
export class Point {
    private _x: number;
    private _y: number;

    set x(newX: number) {
        if(newX < 0) {
            newX = 0;
        }

        this._x = newX;
    }
    get x(): number {
        return this._x;
    }

    set y(newY: number) {
        if(newY < 0) {
            newY = 0;
        }

        this._y = newY;
    }
    get y(): number {
        return this._y;
    }


    constructor(x: number, y: number) { 
        this.set(x, y);
    }

    set(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
}

/** A point in the given map */
export class MapPoint extends Point {
    private mapWidth: number;
    private mapHeight: number;

    constructor(x: number, y: number, gameMap: GameMap) {
        super(x, y);

        this.mapHeight = gameMap.getHeight();
        this.mapWidth = gameMap.getWidth();
    }

    
}