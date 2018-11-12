import { Tile } from "./tile";

export class ExplosionInformation {
    row: number;
    col: number;
    before: Tile;
    /** Contains only the changes from the explosion. */
    after: Partial<Tile>;

    constructor(row: number, col: number, before: Tile, after: Partial<Tile>) {
        this.row = row;
        this.col = col;
        this.before = before;
        this.after = after;
    }
}