import io from 'socket.io-client';
import { SocketClient } from './comm/socket-client';

const serverUrl = "http://localhost:8000"
const socketClient = new SocketClient(true);
socketClient.open(serverUrl);

setTimeout(() => {
    socketClient.close();
}, 2000);