import { Character } from '../../models/Character';
import { Map } from '../../models/Map';
import { CharacterPosition } from '../../models/CharacterPosition';
import { map } from 'bluebird';

let characterId = 1;
let onlinePlayers = 0;

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
  const character = await Character.findByPk(characterId);
  const position = await CharacterPosition.findOne({
    where: { charId: characterId },
    order: [['id', 'DESC']]
  });
  const currentMap = await Map.findByPk(1);
  characterId++;
  onlinePlayers++;

  return { character, position, currentMap };
}

export default (io: any) => async (socket: any) => {
  const { character, position, currentMap } = await initGame();
  if (!currentMap || !character || !position) {
    throw new Error('Server error');
  }
  let currentMapName = currentMap.name;

  const handleMapJoin = (mapName: string) => () => {
    maps[mapName].players.push(character.id);
    console.log(`${mapName} online: (${maps[mapName].players.length})`);
  }

  const handleMapLeave = (mapName: string) => () => {
    const { players } = maps[mapName];
    maps[mapName].players = players
      .filter((charId: number) => charId !== character.id);
  }

  handleMapJoin('Ithan');


  socket.on('changeMap', (nextMapName: string) => {
    socket.leave(currentMapName, handleMapLeave(currentMapName));
    socket.join(nextMapName, handleMapJoin(nextMapName));
    
    console.log(`${currentMapName} => ${nextMapName}`);
    currentMapName = nextMapName;
  });

  socket.on('disconnect', () => {
    onlinePlayers--;
    characterId--;
  });
}