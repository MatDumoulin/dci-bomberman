import { GameObject, ObjectType } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

export const UPGRADE_DROP_RATE = 0.2;

export abstract class Upgrade extends GameObject {
    row: number;
    col: number;

    constructor(tile: Tile) {
        super(tile.info.width, tile.info.height);
        this.col = tile.info.coordinates.x;
        this.row = tile.info.coordinates.y;
        this.coordinates = tile.info.coordinates;
    }

    abstract apply(player: Player): void;
}

export class PowerUp extends Upgrade {
    type = ObjectType.PowerUp;
    row: number;
    col: number;

    constructor(tile: Tile) {
        super(tile);
    }

    apply(player: Player): void {
        ++player.bombPower;
    }
}

export class BombUp extends Upgrade {
    type = ObjectType.BombUp;
    row: number;
    col: number;

    constructor(tile: Tile) {
        super(tile);
    }

    apply(player: Player): void {
        ++player.maxBombCount;
    }
}

export class SpeedUp extends Upgrade {
    type = ObjectType.SpeedUp;
    row: number;
    col: number;

    constructor(tile: Tile) {
        super(tile);
    }

    apply(player: Player): void {
        const upgradeValue = 100;

        if (player.timeBetweenMoves - upgradeValue > 250) {
            player.timeBetweenMoves -= upgradeValue;
        } else {
            player.timeBetweenMoves = 250;
        }
    }
}
