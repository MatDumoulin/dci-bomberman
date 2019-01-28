export class ServerInfo {
    url = "";
    playerCount = 0;
    gameCount = 0;
    viewerCount = 0;

    constructor(url: string, info?: Partial<ServerInfo>) {
        this.url = url;

        if (info) {
            Object.assign(this, info);
        }
    }
}
