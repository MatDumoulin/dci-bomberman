import { GameObject } from "./game-object";
import { PlayerId } from "./player";


export class Bomb extends GameObject {
    private readonly TIME_BEFORE_EXPLOSION = 2; // seconds
    private readonly EXPLOSION_DURATION = 1; // seconds
    plantedBy: PlayerId;


    constructor(plantedBy: PlayerId) {
        super();
        this.width = 32;
        this.height = 32;
        this.plantedBy = plantedBy;
    }
}
