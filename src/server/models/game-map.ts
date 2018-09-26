import { GameObject, ObjectType, WalkableTerrain, Wall, BreakableItem } from "./game-object";
import { Point } from "./point";
import { Bomb } from "./bomb";
import { Tile, OUT_OF_BOUND } from "./tile";

export interface MapDescriptor {
    /** Dimensions of the map (in tiles) */
    height: number;
    width: number;
    /** The descriptor for each tile */
    tiles: ObjectType[][],
    spawnPositions: Point[]
}

export class GameMap {
    private _tiles: Tile[][];
    private _tileWidth = 32; /** In pixels */
    private _tileHeight = 32; /** In pixels */
    private _spawnPositions: Point[];

    // Gets the number of tiles in the x axis of the map.
    getWidth(): number {
        if(!this._tiles || this._tiles.length === 0 || this._tiles[0].length === 0) {
            throw new Error("The map must be initialized before accessing its width.");
        }

        return this._tiles[0].length;
    }

    getTileWidth(): number {
        return this._tileWidth;
    }

    // Gets the number of tiles in the y axis of the map.
    getHeight(): number {
        if(!this._tiles) {
            throw new Error("The map must be initialized before accessing its height.");
        }

        return this._tiles.length;
    }

    getTileHeight(): number {
        return this._tileHeight;
    }

    getSpawns(): Point[] {
        return this._spawnPositions;
    }

    /**
     * Gets the object that is at the given tile.
     * @returns The object at the given tile. Null if out of bound.
     * */
    get(row: number, col: number): Tile {
        if(this.isOutOfBound(row, col)) {
            return OUT_OF_BOUND;
        }

        return this._tiles[row][col];
    }

    getRowFromPixels(y: number): number {
        return Math.floor(y / this._tileHeight);
    }
    getColFromPixels(x: number): number {
        return Math.floor(x / this._tileWidth);
    }
    /** Gets the tile object at the given position. */
    getTileFromPixels(y: number, x: number): Tile {
        const tileRow = this.getRowFromPixels(y);
        const tileCol = this.getColFromPixels(x);

        if(this.isOutOfBound(tileRow, tileCol)) {
            return OUT_OF_BOUND;
        }

        return this._tiles[tileRow][tileCol];
    }

    // This is not a deep clone, which mean that the cells of the map references the same tiles.
    clone(): GameMap {
        const clone = new GameMap();
        clone._spawnPositions = this.getSpawns();
        clone._tiles = this._tiles.map(row => row.map(col => col)); // Shallow copy of the 2d array.

        return clone;
    }

    /**
     * Sets the tile at the given coords to the given value.
     * @param value The new value of the tile. Do not set it to null since it is considered to be out of bound.
     */
    set(row: number, col: number, value: Tile): GameMap {
        if(this.isOutOfBound(row, col)) {
            throw new Error(`Cannot set tile value since it is out of bound. Given coords were [Row=${row}; Col=${col}]`);
        }

        // Since we are working with immutable objects, we got to return the new GameMap.
        const clone = this.clone();

        this._tiles[row][col] = value;
    }

    /** Initializes the map to match the given descriptor. */
    initFromMapDescriptor(descriptor: MapDescriptor) {
        if(!descriptor) {
            throw new Error("Cannot initialize the map with a falsy descriptor.");
        }

        this._tiles = new Array(descriptor.height);
        // Initializing the map.
        for(let row = 0; row < descriptor.height; ++row) {
            this._tiles[row] = new Array(descriptor.width);

            let tileCoords: Point;
            for(let col = 0; col < descriptor.width; ++col) {
                tileCoords = new Point(col * this._tileWidth, row * this._tileHeight);
                let tileInfo: GameObject;


                switch(descriptor.tiles[row][col]) {
                    case ObjectType.Walkable:
                        tileInfo = new WalkableTerrain(tileCoords, this._tileWidth, this._tileHeight);
                        break;
                    case ObjectType.Wall:
                        tileInfo = new Wall(tileCoords, this._tileWidth, this._tileHeight);
                        break;
                    case ObjectType.BreakableItem:
                        tileInfo = new BreakableItem(tileCoords, this._tileWidth, this._tileHeight);
                        break;
                    default: throw new Error("Invalid value in descriptor.");
                }

                const tile = new Tile(tileInfo);

                this._tiles[row][col] = tile;
            }
        }

        // Initializing the spawns
        this._spawnPositions = descriptor.spawnPositions;
    }

    /** Initializes the map with a blank state, which means that all cells are set to walkable. */
    init(width: number, height: number): void {
        this._tiles = new Array(height);

        for(let row = 0; row < height; ++row) {
            this._tiles[row] = new Array(width);

            let tileCoords: Point;
            let tileInfo: GameObject;
            for(let col = 0; col < width; ++col) {
                tileCoords = new Point(col * this._tileWidth, row * this._tileHeight);
                tileInfo = new WalkableTerrain(tileCoords, this._tileWidth, this._tileHeight);
                this._tiles[row][col] = new Tile(tileInfo);
            }
        }
        // Initializing the 4 spawns
        this._spawnPositions = [new Point(0, 0), new Point(width-1, 0), new Point(0, height-1), new Point(width-1, height-1)];
    }

    private isOutOfBound(row: number, col: number): boolean {
        return row < 0 || col < 0 || row >= this.getHeight() || col >= this.getWidth();
    }

}
