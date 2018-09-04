import { SocketClient } from './comm/socket-client';
import { GameManager } from './core/game-manager';

const serverUrl = "http://localhost:8000";
const gameManager = new GameManager();
SocketClient.init(gameManager);
SocketClient.getInstance().open(serverUrl);



setTimeout(() => {
    // socketClient.close();
}, 2000);





// Cleaning up all the resources used by the server.
function cleanUpResources() {
    console.log("Closing socket...");
    SocketClient.getInstance().close();
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
