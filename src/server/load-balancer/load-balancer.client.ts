import { config } from "../../global.config";
import fetch from "node-fetch";

export class LoadBalancerClient {
    private readonly LOAD_BALANCER_URL = `http://${config.loadBalancerHost}:${
        config.loadBalancerPort
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
}
