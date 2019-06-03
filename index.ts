import express from 'express';
import * as http from 'http';
import { sequelize } from './src/db';
import mainController from './src/controllers/main';
import { seedDatabase } from './src/helpers';

const app = express();
const server = new http.Server(app);
const io = require('socket.io')(http);

let force = false;
// force = true;
sequelize.sync({ force })
  .then((): Promise<any> | void => {
    if (force) {
      return seedDatabase();
    }
  })
  .then(() => console.log('synced'))
  .catch(console.log)

io.on('connection', mainController(io));

server.listen(5000);

