import { Character } from '../models/Character';
import { Location } from '../models/Location';
import { CharacterLocation } from '../models/CharacterLocation';
import { ItemLoot as Item, ItemLocation } from '../models/Item';
import { Op } from 'sequelize';

import battleController from './battle';
import npcController from './npc';

let characterId = 1;
let onlinePlayers = 0;
let clientId = 0;

const Ithan: any = {
  players: []
}

const Torneg: any = {
  players: []
}

const maps: any = {
  Ithan: {
    players: []
  },
  Torneg: {
    players: []
  }
}

const socketIds = new Map();

async function initGame() {
  console.log({ clientId });

  const character = await Character.findByPk(clientId);
  const position = await CharacterLocation.findOne({
    where: { charId: clientId },
    order: [['id', 'DESC']]
  });
  const [inventory] = await Promise.all([
    ItemLocation.getInventory(clientId)
  ]);
  const currentMap = await Location.findByPk(1);
  characterId++;
  onlinePlayers++;

  return { character, position, currentMap, inventory };
}

async function getCharsForLocationId (locationId: number, charId: number) {
  const sameLocationChars = await CharacterLocation
  .findAll({
    where: { locationId },
    include: [
      { model: Character }
    ]
  });

  const normalizedChars = sameLocationChars
    .map(char => {
      const { character, ...rest } = char.toJSON();
      return { ...character, ...rest };
    })
    .filter(char => char.id != charId);

  return normalizedChars;
}

async function getDataForNextLocation(nextLocationId: number, charId: number) {

  const [nextLocation, characters] = await Promise.all([
    Location.findByPk(nextLocationId),
    getCharsForLocationId(nextLocationId, charId)
  ]);

  if (!nextLocation || !characters) {
    throw new Error(`Location probably doesnt exists - 404 - REQUEST_LOCATION_CHANGE`);
  }

  return { nextLocation, characters }
}

export default (io: any) => async (socket: any) => {
  clientId++;
  const { character, position, currentMap, inventory } = await initGame();

  if (!currentMap || !character || !position) {
    throw new Error('Server error');
  }
  let currentLocationId: number = currentMap.id;
  let currentLocationRoom: string = `location_${currentLocationId}`;
  let currentMapName = currentMap.name;
  const location = currentMap;
  const char = { ...character.toJSON(), ...position.toJSON() };
  const charId: number = char.id;
  const characters = await getCharsForLocationId(location.id, charId);

  const socketId = socket.id;
  socketIds.set(charId, socketId);

  setTimeout(() => {
    socket.emit('$_LOAD_GAME', {
      type: '$_LOAD_GAME',
      payload: {
        location,
        character: char,
        characters,
        inventory,
        collisions: [
          [0, 1, 1, 1, 0, 1, 0],
          [1, 0, 0, 0, 1, 1, 1],
          [1, 1, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 0, 0, 0],
          [1, 0, 0, 0, 0, 0, 0]
        ],
        mobs: [{
          id: 1,
          name: 'Eagle',
          level: 12,
          status: 'IDLE',
          x: 3,
          y: 5,
          type: { id: 1, damage: 12 }
        }],
        npcs: [{
          id: 1,
          name: 'Anubis',
          x: 2,
          y: 6,
          img: null
        }]
      },
      meta: { io: false, clientId, currentLocationRoom, socketId }
    });
    socket.join(currentLocationRoom);
  }, 500);



  socket.on('REQUEST_LOCATION_CHANGE', async (action: any) => {
    const nextLocationId = action.payload;
    const nextLocationRoom = `location_${nextLocationId}`;

    socket.broadcast
      .to(currentLocationRoom)
      .emit(
        'CHARACTER_LEAVE',
        { type: 'CHARACTER_LEAVE', payload: charId },
        false
      );
    socket.leave(currentLocationRoom);

    const { nextLocation, characters } = await getDataForNextLocation(nextLocationId, charId);

    socket.join(nextLocationRoom);
    socket.broadcast
      .to(nextLocationRoom)
      .emit(
        'CHARACTER_JOIN',
        { type: 'CHARACTER_JOIN', payload: char /* UNSAFE!! - get character from server's redux to make sure its position is correct */ },
        false
      );

    socket.emit('CHANGE_LOCATION', {
      type: 'CHANGE_LOCATION',
      payload: { location: nextLocation, characters }
    }, false);

    currentLocationId = nextLocation.id;
    currentLocationRoom = nextLocationRoom;
  });


  socket.on('CHARACTER_UPDATE', async (action: any) => {
    /* Third arg for stopping io propagation - equivalent for io: false */
    socket.broadcast.emit('$_CHARACTER_UPDATE', {
      ...action,
      type: '$_CHARACTER_UPDATE',
      meta: { ...action.meta, charId },
    });
  });

  
  /* Community */
  const MESSAGE_TYPES = {
    PRIVATE: 'PRIVATE',
    GROUP: 'GROUP',
    CLAN: 'CLAN',
    LOCAL: 'LOCAL',
    GLOBAL: 'GLOBAL'
  }

  socket.on('SEND_MESSAGE', async (action: any) => {
    const { PRIVATE, GROUP, LOCAL } = MESSAGE_TYPES;

    const nextAction = {
      ...action,
      type: 'RECEIVE_MESSAGE',
      payload: {
        ...action.payload,
        fromSocketId: socketId,
        fromCharId: charId
      }
    }


    switch(action.payload.type) {

      case PRIVATE:
        const receiverSocketId = socketIds.get(Number(action.payload.to));

        if (!receiverSocketId) {
          throw new Error(`Socket with id ${receiverSocketId} doesn't exists`);
        }

        io
          .to(receiverSocketId)
          .emit('RECEIVE_MESSAGE', nextAction);
        break;

      case GROUP:
        const groupRoom = `group_${action.payload.to}`;
        socket
          .to(groupRoom)
          .emit('RECEIVE_MESSAGE', nextAction);
        break;

      case LOCAL:
        socket
          .to(currentLocationRoom)
          .emit('RECEIVE_MESSAGE', nextAction);
        break;

      default: throw new Error(`Invalid message type ${action.payload.type}`);
    }
  });

  

  /* Items */

  socket.on('ITEM_DROP', async (action: any) => {
    const $_ITEM_DROPPED_ADD = '$_ITEM_DROPPED_ADD';

    socket
      .to(currentLocationRoom)
      .emit($_ITEM_DROPPED_ADD, {
        ...action,
        type: $_ITEM_DROPPED_ADD,
      });
  });

  socket.on('ITEM_PICKUP', async (action: any) => {
    const $_ITEM_DROPPED_REMOVE = '$_ITEM_DROPPED_REMOVE';

    socket
      .to(currentLocationRoom)
      .emit($_ITEM_DROPPED_REMOVE, {
        ...action,
        type: $_ITEM_DROPPED_REMOVE
      });
  });

  battleController(io, socket, character);
  npcController(io, socket, character);

  console.log(socketIds);

  socket.on('disconnect', () => {
    onlinePlayers--;
    characterId--;
    clientId--;
    socketIds.delete(charId);
  });
}