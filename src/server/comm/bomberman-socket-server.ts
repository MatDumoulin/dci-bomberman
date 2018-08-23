import { SocketServer, SocketManager } from 'dci-game-server';
import { Server } from 'socket.io';
 
export class BombermanSocketServer implements SocketServer {
    private _io: Server;

    constructor(server: Server) {
        if(!server) {
            throw new Error("Server for socket communication cannot be falsy.");
        }

        this._io = server;
    }

    start(): void {
        this._io.on('connection', (socket) => {
            console.log("Welcome Client " + socket.id);

            socket.on('joinGame', () => {
                console.log("Client " + socket.id + " has join the game.");
            });

            socket.on('leaveGame', () => {
                console.log("Client " + socket.id + " has left the game.");
            });

            socket.on('disconnect', () => {
                console.log("Client " + socket.id + " disconnected");
            });
        });
    }

    end(): void {

    }
}