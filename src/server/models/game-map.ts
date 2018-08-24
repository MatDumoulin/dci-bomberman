import { GameObject, OUT_OF_BOUND, ObjectType, WalkableTerrain, Wall, BreakableItem } from "./game-object";
import { Point } from "./point";

export interface MapDescriptor {
    /** Dimensions of the map (in tiles) */
    height: number;
    width: number;
    /** The descriptor for each tile */
    tiles: ObjectType[][]
}


export class GameMap {
    private _tiles: GameObject[][];
    private _tileWidth = 32; /** In pixels */
    private _tileHeight = 32; /** In pixels */


    getWidth(): number {
        if(!this._tiles || this._tiles.length === 0 || this._tiles[0].length === 0) {
            throw new Error("The map must be initialized before accessing its width.");
        }

        return this._tiles[0].length;
    }

    getHeight(): number {
        if(!this._tiles) {
            throw new Error("The map must be initialized before accessing its height.");
        }

        return this._tiles.length;
    }

    /** 
     * Gets the object that is at the given tile.
     * @returns The object at the given tile. Null if out of bound. 
     * */
    get(row: number, col: number): GameObject {
        if(this.isOutOfBound(row, col)) {
            return OUT_OF_BOUND;
        }

        return this._tiles[row][col];
    }

    /**
     * Sets the tile at the given coords to the given value.
     * @param value The new value of the tile. Do not set it to null since it is considered to be out of bound.
     */
    set(row: number, col: number, value: GameObject): void {
        if(this.isOutOfBound(row, col)) {
            throw new Error(`Cannot set tile value since it is out of bound. Given coords were [Row=${row}; Col=${col}]`);
        }

        this._tiles[row][col] = value;
    }

    /** Initializes the map to match the given descriptor. */
    initFromMapDescriptor(descriptor: MapDescriptor) {
        if(!descriptor) {
            throw new Error("Cannot initialize the map with a falsy descriptor.");
        }

        this._tiles = new Array(descriptor.height);
        
        for(let row = 0; row < descriptor.height; ++row) {
            this._tiles[row] = new Array(descriptor.width);

            let tileCoords: Point;
            for(let col = 0; col < descriptor.width; ++col) {
                tileCoords = new Point(col * this._tileWidth, row * this._tileHeight);
                let tile: GameObject;

                switch(descriptor.tiles[row][col]) {
                    case ObjectType.Walkable: 
                        tile = new WalkableTerrain(tileCoords, this._tileWidth, this._tileHeight); 
                        break;
                    case ObjectType.Wall: 
                        tile = new Wall(tileCoords, this._tileWidth, this._tileHeight); 
                        break;
                    case ObjectType.BreakableItem: 
                        tile = new BreakableItem(tileCoords, this._tileWidth, this._tileHeight); 
                        break;
                    default: throw new Error("Invalid value in descriptor.");
                }

                this._tiles[row][col] = tile;
            }
        }
    }

    /** Initializes the map with a blank state, which means that all cells are set to walkable. */
    init(width: number, height: number): void {
        this._tiles = new Array(height);
        
        for(let row = 0; row < height; ++row) {
            this._tiles[row] = new Array(width);

            let tileCoords: Point;
            for(let col = 0; col < width; ++col) {
                tileCoords = new Point(col * this._tileWidth, row * this._tileHeight);
                this._tiles[row][col] = new WalkableTerrain(tileCoords, this._tileWidth, this._tileHeight);
            }
        }
    }

    private isOutOfBound(row: number, col: number): boolean {
        return row < 0 || col < 0 || row >= this.getHeight() || col >= this.getWidth();
    }

}