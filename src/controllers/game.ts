import { Character } from '../models/character';
import { Map } from '../models/Map';

const MAPS = {
  ITHAN: 1,
  TORNEG: 2
}

export default async (io: any, socket: any) => {
  let character: object|any;
  const currentMap = await Map.findOne({ where: { name: 'Torneg' }});
  
  socket.on('in-game', async (characterId: number) => {
    character = await Character.findByPk(characterId);
  });


  
  socket.on('playerMove', async (key: string) => {
    if (!currentMap) return;

    switch(key) {
      case 'w':
        if (character.positionY > 0) {
          character.positionY--;
        }
        break;
      case 'a':
        if (character.positionX > 0) {
          character.positionX--;
        }
        break;
      case 's':
        if (character.positionY < currentMap.height) {
          character.positionY++;
        }
        break;
      case 'd':
        if (character.positionX < currentMap.width) {
          character.positionX++;
        }
        break;
      default: throw new Error(`Invalid key ${key}`);
    }
    io.emit('character', character.toJSON());
    await character.save();
  });
  



  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
}