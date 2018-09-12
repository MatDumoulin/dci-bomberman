import { GameObject, ObjectType } from "./game-object";
import { PlayerAction } from "./player-action";

export type PlayerId = string;

export class Player extends GameObject {
    playerId: PlayerId;
    actions: PlayerAction;
    type = ObjectType.Player;
    joinOrder: number; // starts at 1.


    constructor(playerId: PlayerId, joinOrder: number) {
        super();
        this.playerId = playerId;
        this.actions = new PlayerAction();
        this.joinOrder = joinOrder;
    }
}
