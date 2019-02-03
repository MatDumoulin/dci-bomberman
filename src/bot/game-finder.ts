import fetch from "node-fetch";
import { config } from "../global.config";

export class GameFinder {
    private static readonly LOAD_BALANCER_URL = `http://${
        config.loadBalancerHost
    }:${config.loadBalancerPort}`;

    static next(): Promise<string> {
        return fetch(this.LOAD_BALANCER_URL + "/join-game").then(response =>
            response.text()
        );
    }
}
