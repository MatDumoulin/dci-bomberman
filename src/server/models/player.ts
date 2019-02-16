import { GameObject, ObjectType } from "./game-object";
import { PlayerAction } from "./player-action";
import { Bomb } from "./bomb";

export type PlayerId = string;

export class Player extends GameObject {
    playerId: PlayerId;
    actions: PlayerAction;
    type = ObjectType.Player;
    joinOrder: number; // starts at 1.
    /** Maximum number of bombs that the player can drop at a time. */
    maxBombCount = 1;
    bombs: Bomb[] = []; // There are no bombs from him on the field for the moment.
    isAlive = true;
    /** The wait time between each move that the player makes. This is equivalent to its speed. */
    timeBetweenMoves = 1000;
    /** The last time an action from the player has been made */
    lastMove: number = Number.MIN_SAFE_INTEGER;
    /** If the player can move or not. This is only to help players visualize if they can move. */
    canMove = true;

    /**
     * The power of the explosion for this bomb, in map cell.
     * This power is the number of cells that will be affected by the bomb,
     * starting from the position of the bomb to the end of one side of the explosion.
     */
    bombPower = 2;

    constructor(playerId: PlayerId, joinOrder: number) {
        super(24, 24);
        this.playerId = playerId;
        this.actions = new PlayerAction();
        this.joinOrder = joinOrder;
    }
}
