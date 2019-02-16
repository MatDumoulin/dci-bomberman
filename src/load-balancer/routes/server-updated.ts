import { Request, Response } from "express";
import { config } from "../../global.config";
import { ServerManager } from "../managers";
import { ServerInfo, ServerInfoFromServer } from "../models";

export function ServerUpdated(request: Request, response: Response) {
    const ip = request.ip.split(":").slice(-1);
    const infoFromServer = request.body as ServerInfoFromServer;

    if (ip.length === 0) {
        console.log("The request has an invalid ip address", request.ip);
        response.sendStatus(400);
        return;
    }

    const serverUrl = ip[0] + ":" + config.serverPort;
    if (ServerManager.servers[serverUrl] === undefined) {
        console.log("Unable to find server with ip address", request.ip);
        response.sendStatus(404);
        return;
    }

    const info = getServerInfo(serverUrl, infoFromServer);
    ServerManager.set(info);

    response.sendStatus(200);
}

function getServerInfo(
    url: string,
    infoFromServer: ServerInfoFromServer
): ServerInfo {
    const games = Object.keys(infoFromServer.games).map(
        id => infoFromServer.games[id]
    );

    const info: ServerInfo = { ...infoFromServer, url, games };
    return new ServerInfo(url, info);
}
