import { GameState } from "../state";
import { Player, Point, ObjectType } from "../models";
import { OUT_OF_BOUND } from "../models";

/**
 * This class handles all of the mechanics retaled to collisions in the game.
 * Every manipulation that it does is immutable. That way, we don't have to
 * worry about unwanted side effects.
 */
export class GameEngine {
    static readonly Directions = [
        [-1, 0], // top
        [1, 0], // down
        [0, -1], // left
        [0, 1] // right
    ];
    /**
     * This functions tries to move the player to the given position.
     * If the position is not valid, the position of the player is not updated.
     * @returns true if the player moved, false otherwise.
     */
    static movePlayerTo(
        state: GameState,
        player: Player,
        newPos: Point
    ): boolean {
        // Then, we compute the new position of the player (if no collision).
        const { col, row } = newPos;

        // After that, we adjust the position to match the collisions.
        const tileOfPlayer = state.gameMap.get(row, col);

        // If the destination is in the map and the player can walk on it, move the player
        // prettier-ignore
        if (tileOfPlayer !== OUT_OF_BOUND && tileOfPlayer.info.type === ObjectType.Walkable) {
            player.coordinates = new Point(col, row);
            return true;
        }

        return false;
    }
}
