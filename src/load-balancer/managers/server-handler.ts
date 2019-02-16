import { Room, Client } from "colyseus.js";
import { ServerInfo, GameInfo } from "../models";
import { BehaviorSubject } from "rxjs";
import { RoomAvailable } from "colyseus.js/lib/Room";

export class ServerHandler {
    private _client: Client;
    private _room: Room;
    readonly url: string;
    state: BehaviorSubject<ServerInfo>;
    onJoin: Function = () => {};
    onClose: Function = () => {};

    constructor(url: string, onJoin?: Function, onClose?: Function) {
        this.url = url;
        this.state = new BehaviorSubject(new ServerInfo(url));
        this._client = new Client("ws:" + url);
        this._room = this._client.join("server-info");
        this.onJoin = onJoin;
        this.onClose = onClose;

        this._room.onJoin.addOnce(() => {
            this.listenOnRoomState();
            this.onJoin(this);
        });

        this._room.onLeave.addOnce(() => {
            this.onClose(this);
            this.cleanUpRessources();
        });
    }

    cleanUpRessources(): void {
        if (this._room) {
            this._room.leave();
        }

        if (this._client && this._client.id) {
            this._client.close();
        }

        this.state.complete();
    }

    private listenOnRoomState(): void {
        this._room.onStateChange.add((a: any) => {
            console.log("Parameter a:", a);
            console.log(`[${this.url}] Before: `, this.state.value);
            const newInfo = this.getServerInfo(this._room.state);
            this.state.next(newInfo);

            console.log(`[${this.url}] State has changed.`, this.state.value);
        });
    }

    private getServerInfo(state: any): ServerInfo {
        console.log("getServerInfo: ", state);
        const games = Object.keys(state.games).map(id => state.games[id]);

        const info: ServerInfo = { ...state, games };
        return new ServerInfo(this.url, info);
    }
}
