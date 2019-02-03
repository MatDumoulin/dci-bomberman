import { createServer } from "http";
import { RedisPresence, Server } from "colyseus";
import { config } from "../global.config";
import { RoomHandler, RoomHandlerOptions } from "./rooms";
import { RedisAdapter } from "../core";
import { LoadBalancerClient, LoadBalancerRoom } from "./load-balancer";
import { ServerCli } from "./cli/server-cli";

const http = createServer();
const gameServer = new Server({
    server: http,
    presence: new RedisPresence({
        host: config.redisHost,
        port: config.redisPort
    })
});

const roomOptions: RoomHandlerOptions = {
    customPresence: new RedisAdapter(config.redisHost, config.redisPort)
};

gameServer.register("dci", RoomHandler, roomOptions).then(handler =>
    handler
        .on("create", room => console.log("Room created:", room.roomId))
        .on("dispose", room => console.log("Room disposed:", room.roomId))
        .on("join", (room, client) =>
            console.log("User", client.id, "joined room", room.roomId)
        )
        .on("leave", (room, client) =>
            console.log("User", client.id, "left room", room.roomId)
        )
);

gameServer.register("server-info", LoadBalancerRoom);
gameServer.matchMaker.create("server-info", {});

const PORT = config.serverPort;
let cli: ServerCli;

http.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    cli = new ServerCli(gameServer);
    /* LoadBalancerClient.connect(); */
});

// Cleaning up all the resources used by the server.
/* function cleanUpResources(error: any, s: string) {
    LoadBalancerClient.disconnect();
}

// do something when app is closing
process.on("exit", e => cleanUpResources(e, "exit"));

// catches ctrl+c event
process.on("SIGINT", e => cleanUpResources(e, "SIGINT"));

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", e => cleanUpResources(e, "SIGUSR1"));
process.on("SIGUSR2", e => cleanUpResources(e, "SIGUSR2"));

// catches uncaught exceptions
process.on("uncaughtException", e => cleanUpResources(e, "uncaughtException")); */
