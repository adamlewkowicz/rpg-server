import { Character } from '../../models/Character';
import { Map } from '../../models/Map';
import { CharacterPosition } from '../../models/CharacterPosition';
import { map } from 'bluebird';

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

async function initGame() {
  console.log({ clientId });
  const character = await Character.findByPk(clientId);
  const position = await CharacterPosition.findOne({
    where: { charId: clientId },
    order: [['id', 'DESC']]
  });
  const currentMap = await Map.findByPk(1);
  characterId++;
  onlinePlayers++;

  return { character, position, currentMap };
}

async function getCharsForLocationId (locationId: number) {
  const sameLocationChars = await CharacterPosition
  .findAll({
    where: { mapId: locationId },
    include: [
      { model: Character }
    ]
  });

  const normalizedChars = sameLocationChars
    .map(char => {
      const { character, ...rest } = char.toJSON();
      return { ...character, ...rest };
    });

  return normalizedChars;
}

export default (io: any) => async (socket: any) => {
  clientId++;
  const { character, position, currentMap } = await initGame();

  if (!currentMap || !character || !position) {
    throw new Error('Server error');
  }
  let currentLocationId: number = currentMap.id;
  let currentMapName = currentMap.name;
  const location = currentMap;
  const characters = await getCharsForLocationId(location.id);

  const char = { ...character.toJSON(), ...position.toJSON() };
  const charId: number = char.id;

  setTimeout(() => {
    socket.emit('LOAD_GAME', {
      type: 'LOAD_GAME',
      payload: { location, character: char, characters },
      meta: { io: false, clientId }
    });
  }, 500);



  socket.on('REQUEST_LOCATION_CHANGE', async (action: any) => {
    const { meta: { prevLocationId, nextLocationId }} = action;
    
    // socket.to(`location_${prevLocationId}`).emit('CHARACTER_LEAVE', action, false);

    socket.broadcast.emit('CHARACTER_LEAVE', {
      type: 'CHARACTER_LEAVE',
      payload: charId
    }, false);
    // socket.leave(`location_${nextLocationId}`);

    const nextLocation = await Map.findByPk(nextLocationId);
    const characters = await getCharsForLocationId(nextLocationId);

    if (!nextLocation || !characters) {
      throw new Error(`Location propably doesnt exists - 404 - REQUEST_LOCATION_CHANGE`);
    }

    // socket.join(`location_${nextLocationId}`);
    socket.broadcast.emit('CHARACTER_JOIN', { type: 'CHARACTER_JOIN', payload: char }, false);

    socket.emit('CHANGE_LOCATION', {
      type: 'CHANGE_LOCATION',
      payload: { location: nextLocation, characters }
    }, false);

    currentLocationId = nextLocation.id;
  });


  socket.on('CHARACTER_UPDATE', async (action: any) => {
    /* Third arg for stopping io propagation - equivalent for io: false */
    socket.broadcast.emit('CHARACTER_UPDATE', {
      ...action,
      meta: { ...action.meta, io: false }
    }, false);
  });

  socket.on('disconnect', () => {
    onlinePlayers--;
    characterId--;
    clientId--;
  });
}