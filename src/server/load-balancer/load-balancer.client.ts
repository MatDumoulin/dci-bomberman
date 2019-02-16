import { config } from "../../global.config";
import fetch from "node-fetch";
import { ServerInfo } from "./server-info";

export class LoadBalancerClient {
    private readonly LOAD_BALANCER_URL = `http://${config.loadBalancerHost}:${
        config.loadBalancerApiPort
    }`;

    connect(): Promise<any> {
        return fetch(this.LOAD_BALANCER_URL + "/connect").then(response =>
            response.text()
        );
    }

    disconnect(): Promise<any> {
        return fetch(this.LOAD_BALANCER_URL + "/disconnect").then(response =>
            response.text()
        );
    }

    /* static update(serverInfo: ServerInfo): Promise<any> {
        return fetch(this.LOAD_BALANCER_URL + "/server-update", {
            method: "POST",
            body: JSON.stringify(serverInfo)
        }).then(response => response.text());
    } */
}
