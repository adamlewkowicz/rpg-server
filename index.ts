var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
import { sequelize } from './src/db';
import { Character } from './src/models/Character';
import { Location } from './src/models/Location';
import mainController from './src/controllers/main';

app.get('/', function(req: any, res: any){
  res.sendFile(__dirname + '/index.html');
});

let force = false;
force = true;
sequelize.sync({ force })
  .then((): any => {
    if (force) {
      return Promise.all([
        Character.createWithLocation({ name: 'Razuglag' }),
        Character.createWithLocation({ name: 'Roo' }),
        Character.createWithLocation({ name: 'Booom', locationId: 2 }),
        Character.createWithLocation({ name: 'Test', locationId: 2 }),
        Character.createWithLocation({ name: 'Ratatatat' }),
        Location.create({ name: 'Novigrad' }),
        Location.create({ name: 'Yar' })
      ]);
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

