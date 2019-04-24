import { Character } from '../../models/character';
import { Map } from '../../models/Map';
import handlePlayerMove from './player_move';

const MAPS = {
  ITHAN: 1,
  TORNEG: 2
}

export default async (io: any, socket: any) => {
  const character = await Character.findByPk(1);
  const allMaps = await Map.findAll();
  const currentMap = allMaps[0];
  let currentMapName = currentMap.name;

  const handleCurrentMap = (currentMapName: string) => () => {
    console.log(`Joined map: ${currentMapName}`);

    socket.on('playerMove', handlePlayerMove(io, currentMap, character, socket, currentMapName));
  }

  socket.on('changeMap', (nextMapName: string) => {
    socket.leave(currentMapName);
    console.log(`Left map: ${currentMapName}`);
    socket.join(nextMapName, handleCurrentMap(nextMapName));
    currentMapName = nextMapName;
  });

  // socket.on('changeMap', () => )
  
  



  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
}