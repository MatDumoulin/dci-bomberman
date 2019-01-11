import { Room, Client } from "colyseus";
import { BombermanStats, Stat } from "../models";
import { RedisAdapter } from "../../core";

export interface LeaderboardRoomOptions {
    storageHost: string;
    storagePort: number;
}

export class LeaderboardRoom extends Room<BombermanStats> {
    private readonly STORAGE_WINNER_KEY = "stats:winner";
    private _storage: RedisAdapter;
    // Authorize client based on provided options before WebSocket handshake is complete
    // onAuth (options: any) { }

    // When room is initialized
    onInit(options: LeaderboardRoomOptions) {
        this._storage = new RedisAdapter(
            options.storageHost,
            options.storagePort
        );

        this.getAllStats()
            .then(state => {
                this.setState(state);
                console.log(this.state);
                this.subscribeToStats();
            })
            .catch(err => console.log("Unable to fetch the initial state:", err));
    }

    // Checks if a new client is allowed to join. (default: `return true`)
    // requestJoin (options: any, isNew: boolean) { }

    // When client successfully join the room
    onJoin(client: Client) {}

    // When a client leaves the room
    onLeave(client: Client, consented: boolean) {}

    // When a client sends a message
    onMessage(client: Client, message: any) {}

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {
        this._storage.unsubscribe(this.STORAGE_WINNER_KEY);
    }

    private getAllStats(): Promise<BombermanStats> {
        return new Promise<BombermanStats>((resolve, reject) => {
            const winnerPromise = this._storage.hGetAll("stats:winner");
            const killsPromise = this._storage.hGetAll("stats:kills");
            // Once all data is fetched, we map it to a bomberman stats object.
            Promise.all([winnerPromise, killsPromise])
                .then(stats => {
                    const combinedStats: BombermanStats = {
                        winner: this.parseHashToNumber(stats[0]),
                        kills: this.parseHashToNumber(stats[1])
                    };

                    resolve(combinedStats);
                })
                .catch((err: any) => reject(err));
        });
    }

    private parseHashToNumber(hash: { [key: string]: string }): Stat {
        const parsedHash: Stat = {};
        const keys = Object.keys(hash);

        for (const key of keys) {
            parsedHash[key] = parseInt(hash[key], 10);
        }

        return parsedHash;
    }

    private subscribeToStats(): void {
        this._storage.subscribe(this.STORAGE_WINNER_KEY);

        this._storage.on("message", (key: string, value: string) => {
            const parsedValue = JSON.parse(value);

            if(key === "stats:winner") {
                this.state.winner[parsedValue.player] = parsedValue.value;
            }
            else if(key === "stats:kills") {
                this.state.kills[parsedValue.player] = parsedValue.value;
            }
        });
    }
}
