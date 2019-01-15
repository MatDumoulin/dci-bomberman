import { createServer } from 'http';
import { RedisPresence, Server } from "colyseus";
import { config } from '../global.config';
import { RoomHandler, RoomHandlerOptions } from './rooms';
import { RedisAdapter } from '../core';

const minimist = require('minimist');

const http = createServer();
const gameServer = new Server({
    server: http,
    presence: new RedisPresence({
        host: config.redisHost,
        port: config.redisPort
    })
});

const roomOptions: RoomHandlerOptions = {
    customPresence: new RedisAdapter(
        config.redisHost,
        config.redisPort
    )
};

gameServer.register("dci", RoomHandler, roomOptions).then(handler => handler
    .on("create", (room) => console.log("Room created:", room.roomId))
    .on("dispose", (room) => console.log("Room disposed:", room.roomId))
    .on("join", (room, client) => console.log("User", client.id, "joined room", room.roomId))
    .on("leave", (room, client) => console.log("User", client.id, "left room", room.roomId))
);


const PORT = config.serverPort;

http.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});


// Cleaning up all the resources used by the server.
function cleanUpResources() {
    console.log("Server is closed.");
}

gameServer.onShutdown(cleanUpResources);

//do something when app is closing
/*process.on('exit', cleanUpResources);

//catches ctrl+c event
process.on('SIGINT', cleanUpResources);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', cleanUpResources);
process.on('SIGUSR2', cleanUpResources);

//catches uncaught exceptions
process.on('uncaughtException', cleanUpResources);
*/

