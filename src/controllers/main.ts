import { $_LOAD_GAME } from 'rpg-shared/dist/consts';
import { $LoadGame } from 'rpg-shared/lib/action-types';
import { ExtendedSocket } from '../app';
import { getCharsForLocationId, initGame } from '../helpers';

import battleController from './battle';
import npcController from './npc';
import locationController from './location';
import chatController from './chat';
import * as mocks from '../mocks';

const socketIds = new Map();
let clientId = 0;


export default (io: SocketIO.Server) => async (socket: ExtendedSocket) => {
  clientId++;
  const { character, position, currentMap, inventory } = await initGame(clientId);

  if (!currentMap || !character || !position) {
    throw new Error('Initial server error');
  }

  let currentLocationId: number = currentMap.id;
  let currentLocationRoom: string = `location_${currentLocationId}`;
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
        ...mocks.initialGame
      },
      meta: { io: false, clientId, currentLocationRoom, socketId }
    });
    socket.join(currentLocationRoom);
  }, 500);

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