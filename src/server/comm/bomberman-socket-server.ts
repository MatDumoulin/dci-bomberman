import { SocketServer, SocketManager } from 'dci-game-server';
import { Server } from 'socket.io';
import * as fromState from '../state';
import { PlayerActionWrapper, PlayerId } from '../models';
import { GameManager } from '../core';

/** Singleton class that manages the socket communication for the server */
export class BombermanSocketServer implements SocketServer {
    private static _instance: BombermanSocketServer;
    private _io: Server;
    private _gameManager: GameManager;
    private _playerSocketManager: SocketManager;

    private constructor(server: Server, gameManager: GameManager) {
        if(!server) {
            throw new Error("Server for socket communication cannot be falsy.");
        }
        if(!gameManager) {
            throw new Error("Game manager for server cannot be falsy.");
        }

        this._io = server;
        this._gameManager = gameManager;
        this._playerSocketManager = new SocketManager();
    }

    static getInstance(): BombermanSocketServer {
        if(!this._instance) {
            throw new Error("The instance must be initialized before being used.");
        }

        return this._instance;
    }

    static init(server: Server, gameManager: GameManager) {
        this._instance = new BombermanSocketServer(server, gameManager);
    }

    start(): void {
        this._io.on('connection', (socket) => {
            console.log("Welcome Client " + socket.id);

            socket.on('joinGame', (playerId: PlayerId) => {
                console.log(`Socket id ${socket.id} is now linked to team ${playerId}`);
                console.log("Team " + playerId + " has join the game.");
                this._playerSocketManager.set(playerId, socket);
                this._gameManager.addPlayer(playerId);
            });

            socket.on('viewGame', (playerId: PlayerId) => {
                console.log(`Socket id ${socket.id} is viewing the game.`);
                socket.emit("viewingGame", this._gameManager.getGameState());
            });

            socket.on('leaveGame', () => {
                console.log("Client " + socket.id + " has left the game.");
                socket.broadcast.emit("PlayerLeftGame", socket.id); // TODO: Change for player id instead.
            });

            socket.on('PlayerAction', (newActions: PlayerActionWrapper) => {
                this._gameManager.updatePlayerActions(newActions);
            });

            socket.on('disconnect', () => {
                console.log("Client " + socket.id + " disconnected");
            });
        });
    }

    startGame(gameState: fromState.GameState): void {
        this._io.emit("GameStarted", gameState);
    }

    notifyGameJoined(playerId: PlayerId): void {
        if(!this._playerSocketManager.has(playerId)) {
            throw new Error(`Player with id ${playerId} is not registered in the player socket map.`);
        }

        const playerSocket = this._playerSocketManager.get(playerId);
        playerSocket.emit("GameJoined");
        console.log("GAME JOINED");
    }

    notifyGameStateChanged(gameState: fromState.GameState): void {
        this._io.emit("StateChanged", gameState);
    }

    end(): void {
        this._io.close();
    }
}
