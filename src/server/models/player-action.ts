import { PlayerId } from "./player";

// Moves that the player can do.
export class PlayerAction {
    move_up = false;
    move_down = false;
    move_left = false;
    move_right = false;
    plant_bomb = false;
}

/** Used to describe the action of a given player for the socket communication */
export interface PlayerActionWrapper {
    playerId: PlayerId;
    actions: PlayerAction
}
