import { GameObject, ObjectType } from "./game-object";
import { PlayerAction } from "./player-action";
import { Point } from "./point";
import { Bomb } from "./bomb";

export type PlayerId = string;

export class Player extends GameObject {
    playerId: PlayerId;
    actions: PlayerAction;
    type = ObjectType.Player;
    joinOrder: number; // starts at 1.
    speed = 2;
    maxBombCount = 1; // Maximum number of bombs that the player can drop at a time.
    bombs: Bomb[] = []; // There are no bombs from him on the field for the moment.


    constructor(playerId: PlayerId, joinOrder: number) {
        super();
        this.playerId = playerId;
        this.actions = new PlayerAction();
        this.joinOrder = joinOrder;
        this.width = 30;
        this.height = 30;
    }



/*     canPlantBomb(): boolean {
        return this.bombs.length < this.maxBombCount;
    } */
}
