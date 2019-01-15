import { createClient, RedisClient, ClientOpts } from 'redis';

/**
 * This class moves redis calls to promises. That way, all calls made to redis are async.
 */
export class RedisAdapter {
    private _redis: RedisClient;

    constructor(host: string, port: number) {
        const redisOptions: ClientOpts = {
            host,
            port
        };

        this._redis = createClient(redisOptions);

        // Making sure that the redis instance has pub sub on data enabled.
        // this.enableRealTimeStorage();
    }

    hGetAll(key: string): Promise< {[key: string]: string} > {
        return new Promise<{[key: string]: string}>( (resolve: Function, reject: Function) => {

            this._redis.hgetall(key, (err: any, result: { [key: string]: string }) => {
                if(err) {
                    console.error(err);
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });

        });
    }

    hIncrBy(key: string, field: string, increment: number): Promise<number> {
        return new Promise<number>((resolve: Function, reject: Function) => {

            this._redis.hincrby(key, field, increment, (err: any, result: number) => {
                if(err) {
                    console.error(err);
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });

        });
    }

    hIncr(key: string, field: string): Promise<number> {
        return this.hIncrBy(key, field, 1);
    }

    on(event: "message" | "message_buffer", callback: any) {
        this._redis.on(event, callback);
    }

    publish(channel: string, value: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this._redis.publish(channel, value, (err: Error, numberOfReceiver: number) => {
                if(err) {
                    console.error(err);
                    reject(err);
                }
                else {
                    resolve(numberOfReceiver);
                }
            });
        });
    }

    subscribe(key: string): void {
        this._redis.subscribe(key, (err: Error, result: string) => {
            console.log("Error:", err);
            console.log("Result:", result);
        });
    }

    unsubscribe(key: string): void {
        this._redis.unsubscribe(key);
    }

    private enableRealTimeStorage(): void {
        this._redis.on("ready", () => {
            this._redis.config("SET", "notify-keyspace-events", "AKE");
        });
    }
}
