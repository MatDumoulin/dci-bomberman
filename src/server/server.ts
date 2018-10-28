import { createServer } from 'http';
import * as socketIo from 'socket.io';
import { BombermanSocketServer } from './comm';
import { GameManager } from './core';
import { CliManager } from './cli/cli';
import { GameStateManager } from './state';
import { createStore } from './state/store-creater';
import { GAME_STATE_CHANGED, GAME_JOINED } from './state/actions';

const minimist = require('minimist');

const http = createServer();
const io = socketIo.default(http);

// Parsing the given arguments in order to configure the server.
/**
 * Allowed aguments are:
 * --port: The port that this server will listen on.
 */
const args = minimist(process.argv.slice(2)); // The first 2 arguments are useless.
const PORT = args.port || 3000;

const store = createStore();
const gameManager = new GameManager(store);
BombermanSocketServer.init(io, gameManager);
BombermanSocketServer.getInstance().start();
const cli = new CliManager(gameManager);

// Setting up the state and binding it to the socket manager.
const gameStateManager = new GameStateManager(store);

const socketCommSubscription = store.getActions().subscribe(action => {
    if(action.type === GAME_STATE_CHANGED) {
        BombermanSocketServer.getInstance().notifyGameStateChanged(action.payload);
    }
    else if(action.type === GAME_JOINED) {
        BombermanSocketServer.getInstance().notifyGameJoined(action.payload)
    }
});

http.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});



// Cleaning up all the resources used by the server.
function cleanUpResources() {
    console.log("Cleaning up resources...");
    gameManager.cleanUpResources();
    cli.cleanUpResources();
    socketCommSubscription.unsubscribe();
    BombermanSocketServer.getInstance().end();
    console.log("Server is closed.");
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


