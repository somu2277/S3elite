require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Create HTTP server & bind Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
app.set('io', io);

// Connect to database
connectDB();

// Global Socket.IO Real-Time Enterprise Event Bus
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client Connected: ${socket.id}`);

  // Broadcast real-time ERP events across all Admin & Student dashboards
  socket.on('ERP_EVENT', (data) => {
    console.log('[Socket.IO] Broadcasting ERP_EVENT:', data?.type);
    io.emit('ERP_EVENT', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server & Real-Time Socket.IO running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
