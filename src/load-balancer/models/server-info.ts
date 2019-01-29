export class GameInfo {
    id: string;
    players = 0;
    viewers = 0;

    constructor(id: string) {
        this.id = id;
    }
}

export class ServerInfo {
    url = "";
    playerCount = 0;
    gameCount = 0;
    viewerCount = 0;
    games: GameInfo[] = [];

    constructor(url: string, info?: Partial<ServerInfo>) {
        this.url = url;

        if (info) {
            Object.assign(this, info);
        }
    }
}
