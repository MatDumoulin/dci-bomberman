import { LoadBalancerClient } from "./load-balancer.client";

export class GameInfo {
    id: string;
    players = 0;
    viewers = 0;

    constructor(id: string) {
        this.id = id;
    }
}

export class ServerInfo {
    private playerCount = 0;
    private gameCount = 0;
    private viewerCount = 0;
    private games: { [id: string]: GameInfo } = {};

    constructor() {}

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

export class ServerInfoForLoadBalancer {
    static info = new ServerInfo();

    static addViewer(id: string) {
        this.info.addViewer(id);
        this.notifyLoadBalancer();
    }

    static removeViewer(id: string) {
        this.info.removeViewer(id);
        this.notifyLoadBalancer();
    }

    static addPlayer(id: string) {
        this.info.addPlayer(id);
        this.notifyLoadBalancer();
    }

    static removePlayer(id: string) {
        this.info.removePlayer(id);
        this.notifyLoadBalancer();
    }

    static addGame(info: GameInfo) {
        this.info.addGame(info);
        this.notifyLoadBalancer();
    }

    static removeGame(id: string) {
        this.info.removeGame(id);
        this.notifyLoadBalancer();
    }

    private static notifyLoadBalancer() {
        console.log("Server info has changed:", this.info);
    }
}
