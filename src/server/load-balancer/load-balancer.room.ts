import { Room, Client } from "colyseus";
import { LoadBalancerClient } from "./load-balancer.client";
import { ServerInfo } from "./server-info";

export class LoadBalancerRoom extends Room {
    private _client = new LoadBalancerClient();

    // Authorize client based on provided options before WebSocket handshake is complete
    // onAuth (options: any) { }

    // When room is initialized
    onInit() {
        this.autoDispose = false;
        this.setPatchRate(500); // Send state twice per second, if state changed.

        this._client
            .connect()
            .then(result => console.log("Connected:", result))
            .catch(err => console.log("Error:", err));

        this.setState(ServerInfo.info);
    }

    // Checks if a new client is allowed to join. (default: `return true`)
    // requestJoin (options: any, isNew: boolean) { }

    // When client successfully join the room
    onJoin(client: Client) {}

    // When a client leaves the room
    onLeave(client: Client, consented: boolean) {}

    // When a client sends a message
    onMessage(client: Client, message: any) {}

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {
        console.log("Disposing load balancing");
        this._client.disconnect();
    }
}
