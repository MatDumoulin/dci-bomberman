import { Request, Response } from "express";
import { config } from "../../global.config";
import { ServerManager } from "../managers";

export function ServerDisconnected(request: Request, response: Response) {
    const serverUrl = request.hostname + ":" + config.serverPort;

    ServerManager.remove(serverUrl);
    response.sendStatus(200);
}
