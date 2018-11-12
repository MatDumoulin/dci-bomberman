import { GameObject, ObjectType } from "./game-object";
import { PlayerAction } from "./player-action";
import { Bomb } from "./bomb";

export type PlayerId = string;

export class Player extends GameObject {
    playerId: PlayerId;
    actions: PlayerAction;
    type = ObjectType.Player;
    joinOrder: number; // starts at 1.
    speed = 2;
    /** Maximum number of bombs that the player can drop at a time. */
    maxBombCount = 1;
    bombs: Bomb[] = []; // There are no bombs from him on the field for the moment.
    isAlive = true;

    /** 
     * The power of the explosion for this bomb, in map cell.
     * This power is the number of cells that will be affected by the bomb,
     * starting from the position of the bomb to the end of one side of the explosion.
    */
    bombPower = 2;

    constructor(playerId: PlayerId, joinOrder: number) {
        super();
        this.playerId = playerId;
        this.actions = new PlayerAction();
        this.joinOrder = joinOrder;
        this.width = 26;
        this.height = 26;
    }
}
