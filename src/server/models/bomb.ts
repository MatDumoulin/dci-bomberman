import { GameObject, ObjectType } from "./game-object";
import { PlayerId } from "./player";


export class Bomb extends GameObject {
    private static _idSequence = 0;
    /** Total time that it taked to this bomb before exploding, in ms */
    readonly TIME_BEFORE_EXPLOSION = 2000;
    /** Total duration of the explosion for this bomb, in ms */
    readonly EXPLOSION_DURATION = 1000;
    type = ObjectType.Bomb;
    id: number;
    plantedBy: PlayerId;
    plantedAt: number;
    row: number;
    col: number;

    /**
     * The power of the explosion for this bomb, in map cell.
     * This power is the number of cells that will be affected by the bomb,
     * starting from the position of the bomb to the end of one side of the explosion.
    */
    bombPower: number


    constructor(plantedBy: PlayerId, plantedAt: number, bombPower: number, row: number, col: number) {
        super(32, 32);
        this.plantedBy = plantedBy;
        this.plantedAt = plantedAt;
        this.id = ++Bomb._idSequence;
        this.bombPower = bombPower;
        this.row = row;
        this.col = col;
    }
}
