import { Request, Response } from "express";
import { config } from "../../global.config";
import { ServerManager } from "../managers";

export function ServerDisconnected(request: Request, response: Response) {
    const serverUrl = request.hostname + ":" + config.serverPort;

    if (ServerManager.servers[serverUrl] === undefined) {
        console.log("Unable to find server with ip address", request.ip);
        response.sendStatus(404);
        return;
    }

    ServerManager.remove(serverUrl);
    response.sendStatus(200);
}
