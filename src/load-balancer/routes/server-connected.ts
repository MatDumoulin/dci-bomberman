import { Request, Response } from "express";
import { config } from "../../global.config";
import { ServerManager } from "../managers";
import { ServerInfo } from "../models";

export function ServerConnected(request: Request, response: Response) {
    const ip = request.ip.split(":").slice(-1);

    if (ip.length === 0) {
        console.log("The request has an invalid ip address", request.ip);
        response.sendStatus(400);
        return;
    }

    const serverUrl = ip[0] + ":" + config.serverPort;
    const isSuccess = ServerManager.add(new ServerInfo(serverUrl));

    if (isSuccess) {
        response.sendStatus(200);
    } else {
        response.status(409).send("The room is already registered");
    }
}
