import { GameObject, ObjectType } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

export const UPGRADE_DROP_RATE = 0.2;

export abstract class Upgrade extends GameObject {
    row: number;
    col: number;

    constructor(tile: Tile) {
        super(tile.info.width, tile.info.height);
        this.col = tile.col;
        this.row = tile.row;
        this.coordinates = tile.info.coordinates;
    }

    abstract apply(player: Player): Player;
}

export class PowerUp extends Upgrade {
    type = ObjectType.PowerUp;
    row: number;
    col: number;

    constructor(tile: Tile) {
        super(tile);
    }

    apply(player: Player): Player {
        return {
            ...player,
            bombPower: player.bombPower + 1
        };
    }
}

export class BombUp extends Upgrade {
    type = ObjectType.BombUp;
    row: number;
    col: number;

    constructor(tile: Tile) {
        super(tile);
    }

    apply(player: Player): Player {
        return {
            ...player,
            maxBombCount: player.maxBombCount + 1
        };
    }
}

export class SpeedUp extends Upgrade {
    type = ObjectType.SpeedUp;
    row: number;
    col: number;

    constructor(tile: Tile) {
        super(tile);
    }

    apply(player: Player): Player {
        return {
            ...player,
            speed: player.speed + 1
        };
    }
}
