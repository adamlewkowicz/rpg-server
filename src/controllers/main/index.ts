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

export default (io: any) => async (socket: any) => {
  clientId++;
  const { character, position, currentMap } = await initGame();

  if (!currentMap || !character || !position) {
    throw new Error('Server error');
  }
  
  let currentMapName = currentMap.name;
  const location = currentMap;
  const characters: object[] = [];

  const sameLocationChars = await CharacterPosition
    .findAll({
      where: { mapId: location.id },
      include: [
        { model: Character }
      ]
    });

  const normalizedChars = sameLocationChars
    .map(char => {
      const { character, ...rest } = char.toJSON();
      return { ...character, ...rest };
    });

  const char = { ...character.toJSON(), ...position.toJSON() };

  setTimeout(() => {
    socket.emit('LOAD_GAME', {
      type: 'LOAD_GAME',
      payload: { location, character: char, characters: normalizedChars },
      meta: { io: false }
    });
  }, 500);


  const handleMapJoin = (mapName: string) => () => {
    maps[mapName].players.push(position);
    console.log(`${mapName} online: (${maps[mapName].players.length})`);
  }

  const handleMapLeave = (mapName: string) => () => {
    const { players } = maps[mapName];
    maps[mapName].players = players
      .filter((char: any) => char.charId !== position.charId);
  }

  handleMapJoin('Ithan');

  socket.on('changeMap', (nextMapName: string) => {
    socket.leave(currentMapName, handleMapLeave(currentMapName));
    socket.join(nextMapName, handleMapJoin(nextMapName));
    
    console.log(`${currentMapName} => ${nextMapName}`);
    currentMapName = nextMapName;
    io.emit('PLAYERS', maps);
  });

  socket.on('REQUEST_LOCATION_CHANGE', async (action: any) => {
    const location = await Map.findByPk(action.meta.locationId);
    socket.emit('CHANGE_LOCATION', { payload: { location, characters: {} }});
  });

  let charUpdates = 0;

  socket.on('CHARACTER_UPDATE', async (action: any) => {
    if (charUpdates < 10) {
      /* Third arg for stopping io propagation - equivalent for io: false */
      socket.broadcast.emit('CHARACTER_UPDATE', {
        ...action,
        meta: { ...action.meta, io: false }
      }, false);
      charUpdates++;
    }
  });

  socket.on('playerMove', (key: string) => {

    socket.to(currentMapName).emit('PLAYER_POSITION_CHANGE', character.id, 'X', 12);
  });

  socket.on('disconnect', () => {
    onlinePlayers--;
    characterId--;
    clientId--;
  });
}