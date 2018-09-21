import { GameState } from "../state";
import { Player, Point, ObjectType } from "../models";
import { OUT_OF_BOUND } from "../models";

/**
 * This class handles all of the mechanics retaled to collisions in the game.
 * Every manipulation that it does is immutable. That way, we don't have to
 * worry about unwanted side effects.
 */
export class GameEngine {

    /**
     * This functions tries to move the player to the given position.
     * If the position is not valid, it returns the player without changing it.
     */
    static movePlayerTo(state: GameState, player: Player, newPos: Point): Player {
        // Then, we compute the new position of the player (if no collision).
        const left = newPos.x;
        const top = newPos.y;
        const bottom = top + player.height - 1; // -1 because the pixels are 0 based.
        const right = left + player.width - 1;

        // After that, we adjust the position to match the collisions.
        const topLeftTile = state.gameMap.getTileFromPixels(top, left);
        const topRightTile = state.gameMap.getTileFromPixels(top, right);
        const bottomLeftTile = state.gameMap.getTileFromPixels(bottom, left);
        const bottomRightTile = state.gameMap.getTileFromPixels(bottom, right);


        // If the destination is not out of bound and is not a walkable cell, cancel the move.
        if(topLeftTile === OUT_OF_BOUND || topLeftTile.info.type !== ObjectType.Walkable ||
            topRightTile === OUT_OF_BOUND || topRightTile.info.type !== ObjectType.Walkable ||
            bottomLeftTile === OUT_OF_BOUND || bottomLeftTile.info.type !== ObjectType.Walkable ||
            bottomRightTile === OUT_OF_BOUND || bottomRightTile.info.type !== ObjectType.Walkable) {
                return player;
        }

        const updatedPosition = new Point(left, top);
        const updatedPlayer = {...player, coordinates: updatedPosition};

        return updatedPlayer;
    }
}
