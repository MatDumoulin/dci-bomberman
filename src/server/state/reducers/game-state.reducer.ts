import { Bomb } from "../../models";

export interface GameState {
    gameMap: GameMap;
    players: Player[];
    bombs: Bomb[];
    collectibles: Collectible[];
}

