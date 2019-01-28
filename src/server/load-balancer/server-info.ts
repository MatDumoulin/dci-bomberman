export class InfoForLoadBalancer {
    playerCount = 0;
    gameCount = 0;
    viewerCount = 0;
}

export class ServerInfo {
    static info = new InfoForLoadBalancer();
}
