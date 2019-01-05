import { ObjectType, MapDescriptor, Point } from "../models";

const Walkable = ObjectType.Walkable; // To make it easier to read.
const Wall = ObjectType.Wall;
const BreakableItem = ObjectType.BreakableItem;

export const defaultMap: MapDescriptor = {
    height: 15, /* 15 tiles by 15 */
    width: 15,
    tiles: [
        [Walkable, Walkable, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, Walkable, Walkable],
        [Walkable, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, Walkable],
        [BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem],
        [BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem],
        [BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem],
        [BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem],
        [BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem],
        [BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem],
        [BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem],
        [BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem],
        [BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem],
        [BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem],
        [BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem],
        [Walkable, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, BreakableItem, Wall, Walkable],
        [Walkable, Walkable, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, BreakableItem, Walkable, Walkable],
    ],
    spawnPositions: [new Point(0, 0), new Point(14, 0), new Point(0, 14), new Point(14, 14)]
}