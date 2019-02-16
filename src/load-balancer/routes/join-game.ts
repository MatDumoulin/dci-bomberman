import { Request, Response } from "express";
import { config } from "../../global.config";
import { ServerManager } from "../managers";
import { ServerInfo } from "../models";

const MAX_PLAYER_IN_GAME = 4;

export function JoinGame(request: Request, response: Response) {
    const ip = request.ip.split(":").slice(-1);

    if (ip.length === 0) {
        console.log("The request has an invalid ip address", request.ip);
        response.sendStatus(400);
        return;
    }

    const serverUrl = ip[0] + ":" + config.serverPort;

    // Finding the server with the lowest load, while filling the rooms
    // that need to be filled before starting a game.
    const serverUrls = Object.keys(ServerManager.servers);

    // Servers that have a game that is yet to be filled.
    /*const urlOfNotFullServers = [];
    let highestPlayerCountInUnfilledGame = 0;

    for (const url of serverUrls) {
        // Once we have found a game with MAX_PLAYER_IN_GAME - 1 players, we have found the best candidate for this server.
        for (
            let i = 0;
            i < ServerManager.servers[url].games.length &&
            highestPlayerCountInUnfilledGame !== MAX_PLAYER_IN_GAME - 1;
            ++i
        ) {
            const game = ServerManager.servers[url].games[i];

            // prettier-ignore
            if (game.players < MAX_PLAYER_IN_GAME && highestPlayerCountInUnfilledGame < game.players) {
                highestPlayerCountInUnfilledGame = game.players;
            }
        }

        if (highestPlayerCountInUnfilledGame !== 0) {
            urlOfNotFullServers.push({ url, highestPlayerCountInUnfilledGame });
        }
    }*/

    // Servers with the lowest load
    let lowestGameCount = Number.MAX_SAFE_INTEGER;
    let serverWithLowestLoad: string;

    for (const url of serverUrls) {
        if (ServerManager.servers[url].gameCount < lowestGameCount) {
            lowestGameCount = ServerManager.servers[url].gameCount;
            serverWithLowestLoad = url;
        }
    }

    response.status(200).send(serverWithLowestLoad);
}
