var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
import { sequelize } from './src/db';
import { Character } from './src/models/character';
import { Map } from './src/models/Map';
import gameController from './src/controllers/game';

app.get('/', function(req: any, res: any){
  res.sendFile(__dirname + '/index.html');
});

let force = false;
// force = true;
sequelize.sync({ force })
  .then((): any => {
    if (force) {
      return Promise.all([
        Character.create({ name: 'Razuglag', leve: 31, online: false }),
        Map.create({ name: 'Torneg' })
      ])
    }
    return Promise.resolve;
  })
  .then(() => console.log('synced'))
  .catch(console.log)

io.on('connection', (socket: any) => gameController(io, socket));



http.listen(5000, function() {
  console.log('listening on *:3000');
});

