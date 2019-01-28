require("../core/colyseusjs.polyfill");

import express, { Response, Request } from "express";
import bodyParser from "body-parser";

import { config } from "../global.config";
import { ServerConnected, ServerDisconnected } from "./routes";
import { ServerManager } from "./managers";

const app = express();

// Parsing all request bodies into json.
app.use(bodyParser.json());

const PORT = config.loadBalancerPort;

app.listen(PORT, () => {
    console.log(`Load balancer is listening on port ${PORT}`);
});

app.get("/connect", ServerConnected);
app.get("/disconnect", ServerDisconnected);
app.get("/update", ServerDisconnected);

app.get("*", (req: Request, res: Response) => {
    res.status(200).send("Welcole to the load balancer!");
});

// Cleaning up all the resources used by the server.
function cleanUpResources() {
    ServerManager.cleanUp();
}

// do something when app is closing
process.on("exit", cleanUpResources);

// catches ctrl+c event
process.on("SIGINT", cleanUpResources);

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", cleanUpResources);
process.on("SIGUSR2", cleanUpResources);

// catches uncaught exceptions
process.on("uncaughtException", cleanUpResources);
