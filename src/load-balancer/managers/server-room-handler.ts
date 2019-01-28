import { Room, Client } from "colyseus.js";
import { ServerInfo } from "../models";
import { BehaviorSubject } from "rxjs";

export class ServerRoomHandler {
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
        this._room.onStateChange.add(() => {
            this.state.next(this.getServerInfo());
            console.log(`[${this.url}] State has changed.`, this.state.value);
        });
    }

    private getServerInfo(): ServerInfo {
        return new ServerInfo(this.url, this._room.state);
    }
}
