import { ObjectType } from "./game-object";
import { Point } from "./point";
import { Tile } from "./tile";

export interface MapDescriptor {
    /** Dimensions of the map (in tiles) */
    height: number;
    width: number;
    /** The descriptor for each tile */
    tiles: ObjectType[][];
    spawnPositions: Point[];
}

export interface GameMap {
    tileWidth: number /** In pixels */;
    tileHeight: number /** In pixels */;
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

    /** Initializes the map to match the given descriptor. */
    initFromMapDescriptor(descriptor: MapDescriptor): void;

    /** Initializes the map with a blank state, which means that all cells are set to walkable. */
    init(width: number, height: number): void;

    isOutOfBound(row: number, col: number): boolean;
}
