import { GameObject, ObjectType } from "./game-object";
import { Player } from "./player";

export const UPGRADE_DROP_RATE = 0.2;

export interface Upgrade extends GameObject {
    row: number;
    col: number;

    apply(player: Player): Player;
}

export class PowerUp extends GameObject implements Upgrade {
    type = ObjectType.PowerUp;
    row: number;
    col: number;

    constructor(row: number, col: number) {
        super(32, 32);

        this.row = row;
        this.col = col;
    }

    apply(player: Player): Player {
        return {
            ...player,
            bombPower: player.bombPower + 1
        };
    }
}

export class BombUp extends GameObject implements Upgrade {
    type = ObjectType.BombUp;
    row: number;
    col: number;

    constructor(row: number, col: number) {
        super(32, 32);

        this.row = row;
        this.col = col;
    }

    apply(player: Player): Player {
        return {
            ...player,
            maxBombCount: player.maxBombCount + 1
        };
    }
}

export class SpeedUp extends GameObject implements Upgrade {
    type = ObjectType.BombUp;
    row: number;
    col: number;

    constructor(row: number, col: number) {
        super(32, 32);

        this.row = row;
        this.col = col;
    }

    apply(player: Player): Player {
        return {
            ...player,
            speed: player.speed + 2
        };
    }
}
