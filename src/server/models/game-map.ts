import { ObjectType } from "./game-object";
import { Point } from "./point";
import { Tile } from "./tile";

export interface MapDescriptor {
    /** Dimensions of the map (in tiles) */
    height: number;
    width: number;
    /** The descriptor for each tile */
    tiles: ObjectType[][],
    spawnPositions: Point[]
}


export interface GameMap {
    tileWidth: number; /** In pixels */
    tileHeight: number; /** In pixels */
    tilesOnFire: Point[];

    getWidth(): number;

    getHeight(): number;

    getSpawns(): Point[];

    /**
     * Gets the object that is at the given tile.
     * @returns The object at the given tile. Null if out of bound.
     */
    get(row: number, col: number): Tile;

    set(row: number, col: number, value: Tile): void;

    getRowFromPixels(y: number): number;

    getColFromPixels(x: number): number;

    /**
     * Gets the tile object at the given position.
     */
    getTileFromPixels(y: number, x: number): Tile;

    /**
     * Gets all the tiles that are, partially or fully, in the selection box.
     * @param top The top of the selection box, in pixels.
     * @param left The left of the selection box, in pixels.
     * @param bottom The bottom of the selection box, in pixels.
     * @param right The right of the selection box, in pixels.
     */
    getAllTilesInRange(top: number, left: number, bottom : number, right: number): Tile[];

    /** Initializes the map to match the given descriptor. */
    initFromMapDescriptor(descriptor: MapDescriptor): void;

    /** Initializes the map with a blank state, which means that all cells are set to walkable. */
    init(width: number, height: number): void;

    isOutOfBound(row: number, col: number): boolean;
}
