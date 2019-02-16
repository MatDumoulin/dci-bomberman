import { ServerInfo } from "../models";

export class ServerList {
    static servers: { [url: string]: ServerInfo } = {};

    static set(server: ServerInfo) {
        console.log();
        console.log("[ServerList.set]");
        console.log("Before:", this.servers[server.url]);
        this.servers[server.url] = server;
        console.log("After:", this.servers[server.url]);
    }

    static remove(url: string) {
        console.log();
        console.log("[ServerList.remove]");
        console.log("Before:", this.servers[url]);
        delete this.servers[url];
        console.log("After:", this.servers[url]);
    }
}
