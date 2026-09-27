import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export function connectSocket(token) {
  const socket = io(SOCKET_URL, {
    auth: { token }
  });
  return socket;
}
