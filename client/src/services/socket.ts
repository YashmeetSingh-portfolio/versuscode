import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;

    connect() {
        this.socket = io(SOCKET_URL);
        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });
    }

    getSocket() {
        return this.socket;
    }

    disconnect() {
        this.socket?.disconnect();
    }
}

export const socketService = new SocketService();
