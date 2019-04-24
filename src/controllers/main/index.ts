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
  
  let currentMapName = currentMap.name;
  const location = currentMap;
  const characters = await getCharsForLocationId(location.id);

  const char = { ...character.toJSON(), ...position.toJSON() };

  setTimeout(() => {
    socket.emit('LOAD_GAME', {
      type: 'LOAD_GAME',
      payload: { location, character: char, characters },
      meta: { io: false, clientId }
    });
  }, 500);



  socket.on('REQUEST_LOCATION_CHANGE', async (action: any) => {
    const { locationId } = action.meta;
    const location = await Map.findByPk(locationId);
    const characters = await getCharsForLocationId(locationId);
    socket.emit('CHANGE_LOCATION', { payload: { location, characters }});
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