import {
    GameObject,
    ObjectType,
    WalkableTerrain,
    Wall,
    BreakableItem,
    Point,
    OUT_OF_BOUND,
    Tile,
    GameMap,
    MapDescriptor
} from "../models";

export class GameMapImpl implements GameMap {
    private _tiles: Tile[][];
    private _spawnPositions: Point[];
    readonly tileWidth = 32; /** In pixels */
    readonly tileHeight = 32; /** In pixels */
    tilesOnFire: Point[] = [];

    constructor(tiles?: Tile[][], spawns?: Point[]) {
        if (tiles) {
            this._tiles = tiles;
        }
        if (spawns) {
            this._spawnPositions = spawns;
        }
    }

    getWidth(): number {
        if (
            !this._tiles ||
            this._tiles.length === 0 ||
            this._tiles[0].length === 0
        ) {
            throw new Error(
                "The map must be initialized before accessing its width."
            );
        }

        return this._tiles[0].length;
    }

    getHeight(): number {
        if (!this._tiles) {
            throw new Error(
                "The map must be initialized before accessing its height."
            );
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
        if (this.isOutOfBound(row, col)) {
            return OUT_OF_BOUND;
        }

        return this._tiles[row][col];
    }

    set(row: number, col: number, value: Tile): void {
        if (!this.isOutOfBound(row, col)) {
            this._tiles[row][col] = value;
        }
    }

    /** Initializes the map to match the given descriptor. */
    initFromMapDescriptor(descriptor: MapDescriptor) {
        if (!descriptor) {
            throw new Error(
                "Cannot initialize the map with a falsy descriptor."
            );
        }

        this._tiles = new Array(descriptor.height);
        // Initializing the map.
        for (let row = 0; row < descriptor.height; ++row) {
            this._tiles[row] = new Array(descriptor.width);

            let tileCoords: Point;
            for (let col = 0; col < descriptor.width; ++col) {
                tileCoords = new Point(col, row);
                let tile: Tile;

                switch (descriptor.tiles[row][col]) {
                    case ObjectType.Walkable:
                        // prettier-ignore
                        tile = new Tile(new WalkableTerrain(tileCoords, this.tileWidth, this.tileHeight));
                        break;
                    case ObjectType.Wall:
                        // prettier-ignore
                        tile = new Tile(new Wall(tileCoords, this.tileWidth, this.tileHeight));
                        break;
                    case ObjectType.BreakableItem:
                        // prettier-ignore
                        tile = new Tile(new BreakableItem(tileCoords, this.tileWidth, this.tileHeight));
                        break;
                    default:
                        throw new Error("Invalid value in descriptor.");
                }

                this._tiles[row][col] = tile;
            }
        }

        // Initializing the spawns
        const spawns = descriptor.spawnPositions.map(
            spawnTile => new Point(spawnTile.col, spawnTile.row)
        );

        this._spawnPositions = spawns;
    }

    /** Initializes the map with a blank state, which means that all cells are set to walkable. */
    init(width: number, height: number): void {
        this._tiles = new Array(height);

        for (let row = 0; row < height; ++row) {
            this._tiles[row] = new Array(width);

            let tileCoords: Point;
            for (let col = 0; col < width; ++col) {
                tileCoords = new Point(col, row);
                // prettier-ignore
                this._tiles[row][col] = new Tile(new WalkableTerrain(tileCoords, this.tileWidth, this.tileHeight));
            }
        }
        // Initializing the 4 spawns
        this._spawnPositions = [
            new Point(0, 0),
            new Point(width - 1, 0),
            new Point(0, height - 1),
            new Point(width - 1, height - 1)
        ];
    }

    isOutOfBound(row: number, col: number): boolean {
        return (
            row < 0 ||
            col < 0 ||
            row >= this.getHeight() ||
            col >= this.getWidth()
        );
    }
}
