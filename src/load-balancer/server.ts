import { createServer } from 'http';
import { RedisPresence, Server } from "colyseus";
import { config } from '../global.config';

const http = createServer();
const gameServer = new Server({
    server: http,
    presence: new RedisPresence({
        host: config.redisHost,
        port: config.redisPort
    })
});

/* const leaderboardOptions: LeaderboardRoomOptions = {
    storageHost: config.redisHost,
    storagePort: config.redisPort
};
gameServer.register("leaderboard", LeaderboardRoom, leaderboardOptions).then(handler => handler
    .on("create", (room) => console.log("Leaderboard room created:", room.roomId))
    .on("dispose", (room) => console.log("Leaderboard room disposed:", room.roomId))
    .on("join", (room, client) => console.log("User", client.id, "joined leaderboard", room.roomId))
    .on("leave", (room, client) => console.log("User", client.id, "left leaderboard", room.roomId))
);
 */

const PORT = config.leaderboardPort;
http.listen(PORT, () => {
    console.log(`Leaderboard is listening on port ${PORT}`);
});

/* gameServer.matchMaker.create("leaderboard", leaderboardOptions); */

// Cleaning up all the resources used by the server.
function cleanUpResources() {
    console.log("Leaderboard is closed.");
    http.close();
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

