import { GameObject, ObjectType, WalkableTerrain, Wall, BreakableItem, Point, OUT_OF_BOUND, Tile, GameMap, MapDescriptor } from "../models";

export class GameMapImpl implements GameMap {
    private _tiles: Tile[][];
    private _spawnPositions: Point[];
    readonly tileWidth = 32; /** In pixels */
    readonly tileHeight = 32; /** In pixels */
    tilesOnFire: Point[] = [];

    constructor(tiles?: Tile[][], spawns?: Point[]) {
        if(tiles) {
            this._tiles = tiles;
        }
        if(spawns) {
            this._spawnPositions = spawns;
        }
    }

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

    getSpawns(): Point[] {
        return this._spawnPositions;
    }

    /**
     * Gets the object that is at the given tile.
     * @returns The object at the given tile. Null if out of bound.
     */
    get(row: number, col: number): Tile {
        if(this.isOutOfBound(row, col)) {
            return OUT_OF_BOUND;
        }

        return this._tiles[row][col];
    }

    set(row: number, col: number, value: Tile): void {
        if(!this.isOutOfBound(row, col)) {
            this._tiles[row][col] = value;
        }
    }

    getRowFromPixels(y: number): number {
        return Math.floor(y / this.tileHeight);
    }
    getColFromPixels(x: number): number {
        return Math.floor(x / this.tileWidth);
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

    /**
     * Gets all the tiles that are, partially or fully, in the selection box.
     * @param top The top of the selection box, in pixels.
     * @param left The left of the selection box, in pixels.
     * @param bottom The bottom of the selection box, in pixels.
     * @param right The right of the selection box, in pixels.
     */
    getAllTilesInRange(top: number, left: number, bottom : number, right: number): Tile[] {
        const topTileRow = this.getRowFromPixels(top);
        const bottomTileRow = this.getColFromPixels(bottom);
        const leftTileCol = this.getColFromPixels(left);
        const rightTileCol = this.getColFromPixels(right);

        let tilesInRange: Tile[] = [];
        tilesInRange.push(this.get(topTileRow, leftTileCol));

        if(topTileRow !== bottomTileRow) {
            tilesInRange.push(this.get(bottomTileRow, leftTileCol));
        }

        if(leftTileCol !== rightTileCol) {
            tilesInRange.push(this.get(topTileRow, rightTileCol));
        }

        if(topTileRow !== bottomTileRow && leftTileCol !== rightTileCol) {
            tilesInRange.push(this.get(bottomTileRow, rightTileCol));
        }

        // Remove all out of bound tiles since they are not in the game.
        tilesInRange = tilesInRange.filter(tile => tile !== OUT_OF_BOUND);

        return tilesInRange;
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
                tileCoords = new Point(col * this.tileWidth, row * this.tileHeight);
                let tile: Tile;

                switch(descriptor.tiles[row][col]) {
                    case ObjectType.Walkable:
                        tile = new Tile(new WalkableTerrain(tileCoords, this.tileWidth, this.tileHeight), row, col);
                        break;
                    case ObjectType.Wall:
                        tile = new Tile(new Wall(tileCoords, this.tileWidth, this.tileHeight), row, col);
                        break;
                    case ObjectType.BreakableItem:
                        tile = new Tile(new BreakableItem(tileCoords, this.tileWidth, this.tileHeight), row, col);
                        break;
                    default: throw new Error("Invalid value in descriptor.");
                }

                this._tiles[row][col] = tile;
            }
        }

        // Initializing the spawns
        const spawns = descriptor.spawnPositions.map(spawnTile =>
            new Point(spawnTile.x * this.tileWidth, spawnTile.y * this.tileHeight)
        );

        this._spawnPositions = spawns;
    }

    /** Initializes the map with a blank state, which means that all cells are set to walkable. */
    init(width: number, height: number): void {
        this._tiles = new Array(height);

        for(let row = 0; row < height; ++row) {
            this._tiles[row] = new Array(width);

            let tileCoords: Point;
            for(let col = 0; col < width; ++col) {
                tileCoords = new Point(col * this.tileWidth, row * this.tileHeight);
                this._tiles[row][col] = new Tile(new WalkableTerrain(tileCoords, this.tileWidth, this.tileHeight), row, col);
            }
        }
        // Initializing the 4 spawns
        this._spawnPositions = [
            new Point(0, 0),
            new Point((width-1) * this.tileWidth, 0),
            new Point(0, (height-1) * this.tileHeight),
            new Point((width-1) * this.tileWidth, (height-1) * this.tileHeight)
        ];
    }

    isOutOfBound(row: number, col: number): boolean {
        return row < 0 || col < 0 || row >= this.getHeight() || col >= this.getWidth();
    }
}
