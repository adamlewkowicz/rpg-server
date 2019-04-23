var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
import { sequelize } from './src/db';

app.get('/', function(req: any, res: any){
  res.sendFile(__dirname + '/index.html');
});

sequelize.sync()
  .then(() => {
    console.log('synced')
  })
  .catch(console.log)

io.on('connection', function(socket: any){
  console.log('user connected');

  socket.on('in-game', function(characterId: any) {
    console.log(characterId);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});



http.listen(5000, function() {
  console.log('listening on *:3000');
});

