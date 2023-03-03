const app = require('express')();
const server = require('http').createServer(app);
const constants = require('../constants/index');
const io = require('socket.io')(server);

const port = constants.PORT_SOCKET;

io.on('connection', () => {
  console.log('Connect to socket.io');
});

server.listen(port, () => {
  console.log(`Socket is listening on port ${port}`);
});

if (server.listening) {
  console.log('Socket is configured successfully!');
} else {
  console.log('Socket configuration failed!');
}

module.exports = io;
