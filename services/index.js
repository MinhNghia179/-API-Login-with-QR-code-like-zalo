const http = require('http');
const socketIo = require('socket.io');

module.exports = function (app) {
  const server = http.createServer(app);

  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};
