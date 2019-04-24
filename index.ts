var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
import { sequelize } from './src/db';
import { Character } from './src/models/Character';
import { Map } from './src/models/Map';
import { CharacterPosition } from './src/models/CharacterPosition';
// import gameController from './src/controllers/game';
import mainController from './src/controllers/main';

app.get('/', function(req: any, res: any){
  res.sendFile(__dirname + '/index.html');
});

let force = false;
// force = true;
sequelize.sync({ force })
  .then((): any => {
    if (force) {
      return Promise.all([
        Character.create({ name: 'Razuglag', level: 31, online: false }),
        Character.create({ name: 'Roo', level: 12, online: false }),
        Character.create({ name: 'Booom', level: 12, online: false }),
        Character.create({ name: 'Ratatatat', level: 12, online: false }),
        Map.create({ name: 'Novigrad' }),
        Map.create({ name: 'Yar' }),
        CharacterPosition.create({ mapId: 1, charId: 1 }),
        CharacterPosition.create({ mapId: 1, charId: 2 }),
        CharacterPosition.create({ mapId: 1, charId: 3 }),
        CharacterPosition.create({ mapId: 2, charId: 4 })
      ])
    }
    return Promise.resolve;
  })
  .then(() => console.log('synced'))
  .catch(console.log)

io.on('connection', mainController(io));

/*
const server1 = io
  .of('/server1')
  .on('connection', (socket: any) => gameController(server1, socket));
*/


http.listen(5000, function() {
  console.log('listening on *:3000');
});

