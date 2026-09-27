const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./utils/db');

let io;

const initSocket = (server) => {
  io = new Server(server, { cors: { origin: '*' } });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await pool.query('SELECT id FROM "User" WHERE id = $1', [decoded.id]);
      if (result.rows.length === 0) return next(new Error('User not found'));
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);
    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
