import socket from 'socket.io';

const io = socket(80);

io.on('connection', function(socket){
  socket.broadcast.emit('hi');
});