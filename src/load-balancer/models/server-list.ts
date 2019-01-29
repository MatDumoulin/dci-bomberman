import { ServerInfo } from "../models";

export class ServerList {
    static servers: { [url: string]: ServerInfo } = {};

    static set(server: ServerInfo) {
        this.servers[server.url] = server;
    }

    static remove(url: string) {
        delete this.servers[url];
    }
}
