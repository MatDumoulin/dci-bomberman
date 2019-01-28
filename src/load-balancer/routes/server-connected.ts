import { Request, Response } from "express";
import { config } from "../../global.config";
import { ServerManager } from "../managers";
import { ServerInfo } from "../models";

export function ServerConnected(request: Request, response: Response) {
    const serverUrl = request.hostname + ":" + config.serverPort;
    ServerManager.add(new ServerInfo(serverUrl));

    response.sendStatus(200);
}
