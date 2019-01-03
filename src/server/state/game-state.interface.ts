import { Bomb, GameMap, Player, PlayerId, Upgrade, PlayerAction } from "../models";
import { Observable } from "rxjs";

export interface GameState {
    gameId: string;
    gameMap: GameMap;
    players: { [id: string]: Player };
    bombs: { [id: string]: Bomb };
    collectibles: Upgrade[];
    paused: boolean;
    isOver: boolean;
    hasStarted: boolean;
    time: number;
    winner: PlayerId;
    maxPlayerCount: number;


    startGame(): void;

    pauseGame(): void;

    resumeGame(): void;

    /**
     * Adds the player to the current game if possible.
     * @param playerId The id of the player that wants to join the game.
     * @returns True if the player was able to join the game, false otherwise.
     */
    joinGame(playerId: PlayerId): boolean

    /**
     * Removes the player from the game.
     * @param playerId The id of the player to remove from the game.
     * @returns True if the player was completely removed from the game, false if he can rejoin at any time.
     */
    leaveGame(playerId: PlayerId): boolean;

    updateActionsOfPlayer(playerId: PlayerId, actions: PlayerAction): void;

    isGameFull(): boolean;

    gameTick(currentTime: number): void;

    onGameOver(): Observable<GameState>;

    onStateChanged(): Observable<GameState>

    cleanUpRessources(): void;
}
