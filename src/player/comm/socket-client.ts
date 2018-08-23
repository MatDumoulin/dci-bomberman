import io from 'socket.io-client';


export class SocketClient {
    private _game: any;
    private _socket: SocketIOClient.Socket;

    constructor(gameManager: any) {
        if(!gameManager) {
            throw new Error("A game manager must be given in order for the client to work.");
        }

        this._game = gameManager;
    }

    open(serverUrl: string): void {
        this._socket = io(serverUrl);

        this._socket.on('connect', () => {
            console.log("Connected.");
        });
        this._socket.on('event', (data: any) => {});
        
        this._socket.on('disconnect', () => {
            console.log("Disconnected.");
        });
        
        setTimeout(() => {
            this._socket.emit("joinGame");
            this._socket.emit("leaveGame");
        }, 1000);
    }

    close(): void {
        if(!this._socket) {
            console.error("Cannot close the socket since it's already closed.");
            return;
        }

        this._socket.close();
    }
}