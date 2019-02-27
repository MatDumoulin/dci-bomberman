import { GameObject, ObjectType } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

export const UPGRADE_DROP_RATE = 0.2;

export abstract class Upgrade extends GameObject {
    constructor(tile: Tile) {
        super(tile.info.width, tile.info.height);
        this.coordinates = tile.info.coordinates;
    }

    abstract apply(player: Player): void;
}

export class PowerUp extends Upgrade {
    type = ObjectType.PowerUp;

    constructor(tile: Tile) {
        super(tile);
    }

    apply(player: Player): void {
        ++player.bombPower;
    }
}

export class BombUp extends Upgrade {
    type = ObjectType.BombUp;

    constructor(tile: Tile) {
        super(tile);
    }

    apply(player: Player): void {
        ++player.maxBombCount;
    }
}

export class SpeedUp extends Upgrade {
    type = ObjectType.SpeedUp;

    constructor(tile: Tile) {
        super(tile);
    }

    apply(player: Player): void {
        const upgradeValue = 200;

        if (player.timeBetweenMoves - upgradeValue > 100) {
            player.timeBetweenMoves -= upgradeValue;
        } else {
            player.timeBetweenMoves = 100;
        }
    }
}
