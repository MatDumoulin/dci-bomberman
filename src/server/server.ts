import { createServer } from 'http';
import * as socketIo from 'socket.io';
import { BombermanSocketServer } from './comm/bomberman-socket-server';
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

const socketCommunication = new BombermanSocketServer(io);

socketCommunication.start();

http.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});


