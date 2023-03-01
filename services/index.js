const app = require('express')();

const server = require('http').createServer(app);

const io = require('socket.io')(server);

io.on('connection', () => {
  console.log('Connect to socket.io');
});

module.exports = io;
