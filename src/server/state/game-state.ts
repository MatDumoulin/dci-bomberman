import { GameState } from "./game-state.interface";
import { createDefaultGameMap } from "./default-game-map.factory";
import {
    GameMap,
    Player,
    Bomb,
    PlayerId,
    Upgrade,
    Point,
    PlayerAction,
    Tile,
    PowerUp,
    BombUp,
    SpeedUp,
    ObjectType,
    UPGRADE_DROP_RATE,
    OUT_OF_BOUND
} from "../models";
import { GameEngine } from "../core/game-engine";
import { ExplosionInformation } from "../models/explosion-information";
import { Subject, Observable } from "rxjs";

export class GameStateImpl implements GameState {
    private _gameOverObservable = new Subject<GameState>();
    private _stateChangedObservable = new Subject<GameState>();
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

    constructor(id: string) {
        this.gameId = id;
        this.gameMap = createDefaultGameMap();
        this.players = {};
        this.bombs = {};
        this.collectibles = [];
        this.paused = false;
        this.isOver = false;
        this.hasStarted = false;
        this.time = 0;
        this.winner = null;
        this.maxPlayerCount = 4;
    }

    startGame(): void {
        // Set the position of all players to their spawn.
        this.hasStarted = true;
        this._stateChangedObservable.next(this);
    }

    pauseGame(): void {
        this.paused = true;
        this._stateChangedObservable.next(this);
    }

    resumeGame(): void {
        this.paused = false;
        this._stateChangedObservable.next(this);
    }

    /**
     * Adds the player to the current game if possible.
     * @param playerId The id of the player that wants to join the game.
     * @returns True if the player was able to join the game, false otherwise.
     */
    joinGame(playerId: PlayerId): boolean {
        if (this.players[playerId]) {
            return true; // The player is rejoining the game.
        }

        const currentNumberOfPlayer = Object.keys(this.players).length + 1;
        // If the game is full, the player cannot join the game.
        if (currentNumberOfPlayer > this.maxPlayerCount) {
            return false;
        }

        const newPlayer = new Player(playerId, currentNumberOfPlayer);
        this.setPlayerPositionToSpawn(newPlayer);
        this.players[playerId] = newPlayer;
        this._stateChangedObservable.next(this);

        return true;
    }

    /**
     * Removes the player from the game.
     * @param playerId The id of the player to remove from the game.
     * @returns True if the player was completely removed from the game, false if he can rejoin at any time.
     */
    leaveGame(playerId: PlayerId): boolean {
        // If the game has already started, leave the player in the game since he can rejoin at any time.
        if (this.hasStarted) {
            return false;
        }

        // Else, we remove the player from the list of players.
        delete this.players[playerId];

        this._stateChangedObservable.next(this);
        // Then, signal that the player was completely removed from the game.
        return true;
    }

    updateActionsOfPlayer(playerId: PlayerId, actions: PlayerAction): void {
        this.players[playerId].actions = actions;
        this._stateChangedObservable.next(this);
    }

    isGameFull(): boolean {
        const playerCount = Object.keys(this.players).length;
        return playerCount >= this.maxPlayerCount;
    }

    gameTick(currentTime: number): void {
        this.time = currentTime;

        // For each tile on fire, check if the explosion is over.
        let currentTile: Tile;
        for (let row = 0; row < this.gameMap.getHeight(); ++row) {
            for (let col = 0; col < this.gameMap.getWidth(); ++col) {
                currentTile = this.gameMap.get(row, col);
                // prettier-ignore
                if (currentTile.isOnFire && currentTile.timeOfEndOfFire < this.time) {
                    currentTile.isOnFire = false;
                }
            }
        }

        // Then, for each player, update their position and check if they walk on
        // something that would change their state.
        const playerIds = Object.keys(this.players);
        const consumedCollectibles: Tile[] = []; // This is a slight optimization to remove the collectibles from the game map.
        let tileOfPlayer: Tile;

        for (const playerId of playerIds) {
            const player = this.players[playerId];
            // Only move the player if he's alive.
            if (player.isAlive) {
                // Move the player and check for bomb plant.
                this.handlePlayerActions(player, currentTime);

                // We get the tile that the player is on currently.
                tileOfPlayer = this.gameMap.get(
                    player.coordinates.y,
                    player.coordinates.x
                );

                // We check for player kill.
                if (tileOfPlayer.isOnFire) {
                    player.isAlive = false;
                    this.checkForWinner();
                }
                // Check if the player walked on a collectible.
                if (tileOfPlayer.collectible !== null) {
                    tileOfPlayer.collectible.apply(player);
                    consumedCollectibles.push(tileOfPlayer);
                }
            }
        }

        // Remove the collectibles from the game map.
        for (const consumedTile of consumedCollectibles) {
            consumedTile.collectible = null;
        }

        this.collectibles = this.collectibles.filter(
            collectible =>
                !consumedCollectibles.some(
                    consumed =>
                        consumed.info.coordinates.x === collectible.col &&
                        consumed.info.coordinates.y === collectible.row
                )
        );

        const bombIds = Object.keys(this.bombs);
        // Look for exploding bombs.
        for (const bombId of bombIds) {
            const bomb = this.bombs[bombId];

            if (bomb.plantedAt + bomb.TIME_BEFORE_EXPLOSION <= this.time) {
                this.bombExploded(bomb);
            }
        }

        this._stateChangedObservable.next(this);
    }

    /**
     * @param playerId The id of the player that wants to plant a bomb.
     * @returns True if the bomb was successfully planted, false otherwise.
     */
    private plantBomb(playerId: PlayerId): boolean {
        const player = this.players[playerId];

        if (!player || player.bombs.length >= player.maxBombCount) {
            return false;
        }

        this.bombPlanted(playerId);
        return true;
    }

    private bombPlanted(playerId: PlayerId): void {
        const player = this.players[playerId];
        // Use the position of the player determine where the bomb should be planted.
        const bombLocation = new Point(
            player.coordinates.x,
            player.coordinates.y
        );

        // Adding the bomb to the player.
        const bomb = new Bomb(
            playerId,
            this.time,
            player.bombPower,
            bombLocation
        );
        player.bombs.push(bomb);
        // The player can send the drop bomb action for more than one game tick. This
        // prevents unwanted double bomb drop.
        player.actions.plant_bomb = false;

        // Adding the bomb to the map.
        const tileOfBomb = this.gameMap.get(bombLocation.y, bombLocation.x);
        tileOfBomb.bombs.push(bomb);

        // Adding the bomb to the list of bombs
        this.bombs[bomb.id] = bomb;
    }

    private bombExploded(bomb: Bomb): void {
        // We first get the effect of the explosion on the map. At the same time,
        // it provides us the list of cells that are now contained in the explosion.
        const affectedCells = this.getExplosionImpactOnMap(
            this.gameMap,
            bomb,
            this.time
        );

        // From this list we add the new collectibles to the collectible list.
        // When no collectibles were dropped by the bomb explosion, the collectible value is set to null.
        const newCollectibles = affectedCells
            .map(change => change.after.collectible)
            .filter(collectible => collectible !== null);
        // If the collectible value was set and now is gone, the player destroyed the collectible.
        const removedCollectibles = affectedCells
            .filter(
                change =>
                    change.before.collectible !== null &&
                    change.after.collectible === null
            )
            .map(change => change.before.collectible);

        const remainingCollectibles = this.collectibles.filter(
            collectible =>
                !removedCollectibles.some(
                    removed =>
                        removed.col === collectible.col &&
                        removed.row === collectible.row
                )
        );

        this.collectibles = [...remainingCollectibles, ...newCollectibles];

        // Then, from the same list, we get the updated map.
        let tile: Tile;
        for (const explosionOnTile of affectedCells) {
            tile = this.gameMap.get(explosionOnTile.row, explosionOnTile.col);
            // Assigns all values of the explosion effect to the tile.
            Object.assign(tile, explosionOnTile.after);
        }

        // Then, we remove the bomb from the player that planted it.
        // We let a grace period of one game tick to the players to check if there are killed by the explosion.
        this.players[bomb.plantedBy].bombs = this.players[
            bomb.plantedBy
        ].bombs.filter(bombOfPlayer => bombOfPlayer.id !== bomb.id);

        // Finally, we remove the bomb from the list of bombs.
        delete this.bombs[bomb.id];
    }

    private setPlayerPositionToSpawn(player: Player): void {
        const spawns = this.gameMap.getSpawns();

        // If there are more players than spawns, throw an error.
        if (spawns.length < player.joinOrder) {
            throw new Error(
                `There are too many players for the map. The map allows ${
                    spawns.length
                } but a player with joinOrder ${
                    player.joinOrder
                } was able to join.`
            );
        }

        // Working with a copy of the spawn since it will become the new position of the player.
        const playerIds = Object.keys(this.players);
        // Find the first spawn that is not occupied by a player.
        const spawnRef = spawns.find(spawn => {
            const tileOfSpawn = this.gameMap.get(spawn.y, spawn.x);

            return !playerIds.some(id => {
                const tileOfPlayer = this.gameMap.get(
                    this.players[id].coordinates.y,
                    this.players[id].coordinates.x
                );

                return (
                    // prettier-ignore
                    tileOfPlayer.info.coordinates.x === tileOfSpawn.info.coordinates.x &&
                    tileOfPlayer.info.coordinates.y === tileOfSpawn.info.coordinates.y
                );
            });
        });

        // If there is a spawn left, move the player to that spawn.
        // Otherwise, do not move the player.
        if (spawnRef) {
            const spawnCopy = new Point(spawnRef.x, spawnRef.y);

            player.coordinates = new Point(spawnCopy.x, spawnCopy.y);
        }
    }

    private checkForWinner() {
        // If there is only one player left, he has won.
        const alivePlayers: PlayerId[] = [];
        const playerIds = Object.keys(this.players);

        for (const idOfPlayer of playerIds) {
            if (this.players[idOfPlayer].isAlive) {
                alivePlayers.push(idOfPlayer);
            }
        }

        if (alivePlayers.length === 1) {
            this.playerHasWon(alivePlayers[0]);
        }
    }

    private playerHasWon(playerId: PlayerId) {
        this.winner = playerId;
        this.isOver = true;

        this._gameOverObservable.next(this);
    }

    /**
     * Checks if the player can perform and action. If so,
     * perform the action.
     */
    private handlePlayerActions(player: Player, currentTime: number): void {
        // prettier-ignore
        if (!player.canMove && player.lastMove + player.timeBetweenMoves <= currentTime) {
            player.canMove = true;
        }

        if (player.canMove) {
            const playerDidMove = this.updatePlayerPosition(player);

            if (playerDidMove) {
                player.canMove = false;
                player.lastMove = currentTime;
            }
        }

        // Check for plant bomb
        if (player.actions.plant_bomb) {
            this.plantBomb(player.playerId);
        }
    }

    /**
     * Updates the position of the player.
     * @returns true if the player moved, false otherwise.
     */
    private updatePlayerPosition(player: Player): boolean {
        const move = { x: 0, y: 0 };
        // First, we convert the move to numeric values.
        if (player.actions.move_up) {
            move.y = -1;
        } else if (player.actions.move_down) {
            move.y = 1;
        } else if (player.actions.move_left) {
            move.x = -1;
        } else if (player.actions.move_right) {
            move.x = 1;
        }
        // If the player is not moving, do nothing.
        else {
            return false;
        }

        // Then, we compute the new position of the player (if no collision).
        const col = player.coordinates.x + move.x;
        const row = player.coordinates.y + move.y;

        const desiredNewPosition = new Point(col, row);
        return GameEngine.movePlayerTo(this, player, desiredNewPosition);
    }

    private getExplosionImpactOnMap(
        gameMap: GameMap,
        bomb: Bomb,
        currentTime: number
    ): ExplosionInformation[] {
        const mapTransformation: ExplosionInformation[] = [];
        let tile: Tile;
        let after: Partial<Tile>;
        // First up, we check get all the tiles exposed to the explosion.
        for (const direction of GameEngine.Directions) {
            for (let i = 1; i < bomb.bombPower; ++i) {
                const probedRow = bomb.coordinates.y + direction[0] * i;
                const probedCol = bomb.coordinates.x + direction[1] * i;
                tile = gameMap.get(probedRow, probedCol);

                // We set the tile on fire.
                after = {
                    isOnFire: true,
                    timeOfEndOfFire: currentTime + bomb.EXPLOSION_DURATION,
                    collectible: null
                };

                // If the explosion is blocked by a wall,
                // prettier-ignore
                if (tile === OUT_OF_BOUND || tile.info.type === ObjectType.Wall) {
                    // Quit this nested loop since the explosion has been stopped.
                    break;
                }
                // If the tile is breakable, set it to walkable now and potentially generate an upgrade.
                else if (tile.info.type === ObjectType.BreakableItem) {
                    let upgrade: Upgrade = null;

                    if (Math.random() < UPGRADE_DROP_RATE) {
                        upgrade = this.generateUpgrade(tile);
                    }

                    after.info = {
                        ...tile.info,
                        type: ObjectType.Walkable
                    };

                    after.collectible = upgrade;

                    mapTransformation.push(
                        new ExplosionInformation(
                            probedRow,
                            probedCol,
                            tile,
                            after
                        )
                    );
                    // Quit this nested loop since the explosion has been stopped by the breakable item.
                    break;
                } else {
                    mapTransformation.push(
                        new ExplosionInformation(
                            probedRow,
                            probedCol,
                            tile,
                            after
                        )
                    );
                }
            }
        }

        // Then, we remove the bomb from the map.
        tile = gameMap.get(bomb.coordinates.y, bomb.coordinates.x);
        after = {
            isOnFire: true,
            timeOfEndOfFire: currentTime + bomb.EXPLOSION_DURATION,
            bombs: tile.bombs.filter(bombInArray => bomb.id !== bombInArray.id),
            collectible: null
        };

        mapTransformation.push(
            new ExplosionInformation(
                bomb.coordinates.y,
                bomb.coordinates.x,
                tile,
                after
            )
        );

        return mapTransformation;
    }

    private generateUpgrade(tile: Tile): Upgrade {
        const upgradeCount = 3;
        const upgradeNumber = Math.floor(Math.random() * upgradeCount);
        let upgrade: Upgrade;

        // PowerUp
        if (upgradeNumber === 0) {
            upgrade = new PowerUp(tile);
        }
        // BombUp
        else if (upgradeNumber === 1) {
            upgrade = new BombUp(tile);
        }
        // SpeedUp
        else {
            upgrade = new SpeedUp(tile);
        }

        return upgrade;
    }

    onGameOver(): Observable<GameState> {
        return this._gameOverObservable;
    }
    onStateChanged(): Observable<GameState> {
        return this._stateChangedObservable;
    }

    cleanUpRessources(): void {
        this._gameOverObservable.complete();
        this._stateChangedObservable.complete();
    }
}
