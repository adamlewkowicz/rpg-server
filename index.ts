var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
import { sequelize } from './src/db';
import { Character } from './src/models/Character';
import { Location } from './src/models/Location';
import { Item, CharacterItem, ItemType } from './src/models/Item';
import mainController from './src/controllers/main';

app.get('/', function(req: any, res: any){
  res.sendFile(__dirname + '/index.html');
});

let force = false;
force = true;
sequelize.sync({ force })
  .then(async (): Promise<any> => {
    if (force) {
      await Promise.all([
        Character.createWithLocation({ name: 'Razuglag' }),
        Character.createWithLocation({ name: 'Roo' }),
        Character.createWithLocation({ name: 'Booom', locationId: 2 }),
        Character.createWithLocation({ name: 'Test', locationId: 2 }),
        Character.createWithLocation({ name: 'Ratatatat' }),
        Location.create({ name: 'Novigrad' }),
        Location.create({ name: 'Yar' }),
        ItemType.create({ name: 'Weeper' }),
        ItemType.create({ name: 'Zireael' }),
      ])
      await Promise.all([
        Item.create({ lootedBy: 1, typeId: 1 }),
        Item.create({ lootedBy: 1, typeId: 2 }),
        Item.create({ lootedBy: 2, typeId: 2 })
      ])
      return Promise.all([
        CharacterItem.create({ charId: 1, itemId: 1, position: 1 }),
        CharacterItem.create({ charId: 1, itemId: 1, position: 2 }),
        CharacterItem.create({ charId: 1, itemId: 2, position: 3 }),
        CharacterItem.create({ charId: 2, itemId: 2, position: 1 })
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

