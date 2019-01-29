export class GameInfo {
    id: string;
    players = 0;
    viewers = 0;

    constructor(id: string) {
        this.id = id;
    }
}

export class InfoForLoadBalancer {
    private playerCount = 0;
    private gameCount = 0;
    private viewerCount = 0;
    private games: { [id: string]: GameInfo } = {};

    addViewer(id: string) {
        ++this.games[id].viewers;
        ++this.viewerCount;
    }

    removeViewer(id: string) {
        --this.games[id].viewers;
        --this.viewerCount;
    }

    addPlayer(id: string) {
        ++this.games[id].players;
        ++this.playerCount;
    }

    removePlayer(id: string) {
        --this.games[id].players;
        --this.playerCount;
    }

    addGame(info: GameInfo) {
        this.games[info.id] = info;
        ++this.gameCount;
    }

    removeGame(id: string) {
        delete this.games[id];
        --this.gameCount;
    }
}

export class ServerInfo {
    static info = new InfoForLoadBalancer();
}
