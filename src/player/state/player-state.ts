import { ActionQueue } from "../core/action-queue";

export class PlayerState {
    isInGame = false; /** If the player has joined a game */
    playerId: string;
    actions: ActionQueue;

    constructor(playerId: string) {
        this.playerId = playerId;
        this.actions = new ActionQueue();

        this.actions.set({
            move_up: false,
            move_down: false,
            move_left: false,
            move_right: false,
            plant_bomb: false
        })
    }
}
