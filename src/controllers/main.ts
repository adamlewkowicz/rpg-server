import { Character } from '../models/Character';
import { Location } from '../models/Location';
import { CharacterLocation } from '../models/CharacterLocation';
import { ItemLoot as Item, ItemLocation } from '../models/Item';
import { Op } from 'sequelize';

import battleController from './battle';
import npcController from './npc';
import locationController from './location';
import chatController from './chat';
import { $_LOAD_GAME } from 'rpg-shared/dist/consts';
import { $LoadGame } from 'rpg-shared/lib/action-types';

let clientId = 0;

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
    socket.emit($_LOAD_GAME, {
      type: $_LOAD_GAME,
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
          lvl: 12,
          status: 'IDLE',
          x: 3,
          y: 5,
          type: {
            id: 1,
            name: 'Eagle',
            category: 'common',
            img: ''
          }
        }],
        npcs: [{
          id: 1,
          name: 'Anubis',
          x: 2,
          y: 6,
          lvl: 4,
          img: ''
        }],
        inventorySize: 30
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


  battleController(io, socket, character);
  npcController(io, socket, character);
  locationController(io, socket, { currentLocationRoom, character });
  chatController(io, socket, { socketIds, currentLocationRoom });

  console.log(socketIds);

  socket.on('disconnect', () => {
    clientId--;
    socketIds.delete(charId);
  });
}