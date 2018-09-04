import io from 'socket.io-client';
import { GameManager } from '../core/game-manager';
import { GameState } from '../../server/state';
import { PlayerAction } from '../../server/models';

/** Singleton class that manages the socket communication for the client */
export class SocketClient {
    private _gameManager: GameManager;
    private _socket: SocketIOClient.Socket;

    private static _instance: SocketClient;

    private constructor(playerState: GameManager) {
        if(!playerState) {
            throw new Error("A game manager must be given in order for the client to work.");
        }

        this._gameManager = playerState;
    }

    static getInstance(): SocketClient {
        if(!this._instance) {
            throw new Error("The instance must be initialized before being used.");
        }

        return this._instance;
    }

    static init(playerState: GameManager) {
        this._instance = new SocketClient(playerState);
    }


    open(serverUrl: string): void {
        this._socket = io(serverUrl);

        this._socket.on('connect', () => {
            console.log("Connected.");
            this._socket.emit("joinGame", this._gameManager.getPlayerState().playerId);
        });

        this._socket.on('GameJoined', () => {
            console.log("Player has joined a game. Waiting for the game to start...");
            this._gameManager.joinGame();
        });

        this._socket.on('GameStarted', (gameState: GameState) => {
            console.log("Game has started.");
            this._gameManager.startGame(gameState);
        });

        this._socket.on('StateChanged', (gameState: GameState) => {
            this._gameManager.setGameState(gameState);
        });

        this._socket.on('disconnect', () => {
            console.log("Disconnected.");
            this._socket.emit("leaveGame");
        });
    }

    sendPlayerActions(playerId: string, newActions: PlayerAction): void {
        if(!this._socket) {
            throw new Error("The socket client must be opened before sending the player actions");
        }

        console.log("Sending player actions", newActions);

        this._socket.emit("PlayerAction", {playerId, actions: newActions})
    }

    close(): void {
        if(!this._socket) {
            console.error("Cannot close the socket since it's already closed.");
            return;
        }

        this._socket.close();
    }
}
