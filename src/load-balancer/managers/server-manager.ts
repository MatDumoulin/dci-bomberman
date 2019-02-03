import { ServerList, ServerInfo } from "../models";
import { ServerHandler } from "./server-handler";
import { Subscription } from "rxjs";

export class ServerManager extends ServerList {
    private static _rooms: ServerHandler[] = [];
    private static _subscriptions: Subscription[] = [];

    static add(server: ServerInfo): boolean {
        if (this._rooms.some(r => r.url === server.url)) {
            return false;
        }

        this._rooms.push(
            new ServerHandler(
                server.url,
                this.onRoomJoin.bind(this),
                this.onRoomClose.bind(this)
            )
        );

        return true;
    }

    static remove(url: string) {
        for (const index in this._rooms) {
            if (this._rooms[index].url === url) {
                this._rooms[index].cleanUpRessources();
                delete this._rooms[index];
                break;
            }
        }

        super.remove(url);
    }

    private static onRoomJoin(room: ServerHandler) {
        if (room) {
            // Listening on room state change.
            this._subscriptions.push(
                room.state.subscribe(info => super.set(info))
            );
        }
    }

    private static onRoomClose(room: ServerHandler) {
        if (room) {
            // removing the room from the list of rooms.
            this._rooms = this._rooms.filter(r => r.url !== room.url);
        }
    }

    static cleanUp(): void {
        for (const sub of this._subscriptions) {
            sub.unsubscribe();
        }

        for (const room of this._rooms) {
            room.cleanUpRessources();
        }
    }
}
