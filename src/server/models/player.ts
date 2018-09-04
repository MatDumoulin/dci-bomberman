import { GameObject } from "./game-object";
import { PlayerAction } from "./player-action";

export type PlayerId = string;

export class Player extends GameObject {
    playerId: PlayerId;
    actions: PlayerAction;
}
