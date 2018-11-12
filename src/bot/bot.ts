// To prevent typescript errors
(global as any).WebSocket =  require('ws');

import { Client, DataChange } from "colyseus.js";
import { PlayerAction } from "../server/models";
const minimist = require('minimist');
const uuid = require('uuid/v4');

console.log((global as any).WebSocket);
// Parsing the given arguments in order to configure the server.
/**
 * Allowed aguments are:
 * --port: The port that this server will listen on.
 */
const args = minimist(process.argv.slice(2)); // The first 2 arguments are useless.
const serverUrl = args.server || "localhost:3000";

const client = new Client('ws:' + serverUrl);
client.id = uuid();

const room = client.join("dci");

let interval: any;

room.onJoin.add(() => {
    console.log("Bot has joined room ", room.id);
});

room.listen(":hasStarted", (change: DataChange) => {
    if(change.value === true) {
        console.log("Game has started.");
        sendRandomMoves();
    }
});

function sendRandomMoves() {
    interval = setInterval(() => {
        const randomMove = Math.floor(Math.random() * 5);
        const actions = new PlayerAction();

        if(randomMove === 0) {
            actions.move_down = true;
        }
        else if(randomMove === 1) {
            actions.move_up = true;
        }
        else if(randomMove === 2) {
            actions.move_left = true;
        }
        else if(randomMove === 3) {
            actions.move_right = true;
        }
        // If === 4, don't move.

        room.send({
            type: "PlayerAction", 
            payload: {playerId: this._client.id, actions}
        });
    }, 3000);
}

function cleanUpResources() {
    if(interval) {
        clearInterval(interval);
    }

    if(room && room.hasJoined) {
        room.leave();
    }
}


//do something when app is closing
process.on('exit', cleanUpResources);

//catches ctrl+c event
process.on('SIGINT', cleanUpResources);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', cleanUpResources);
process.on('SIGUSR2', cleanUpResources);

//catches uncaught exceptions
process.on('uncaughtException', cleanUpResources);
