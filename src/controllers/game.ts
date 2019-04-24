import { Character } from '../models/character';
import { Map } from '../models/Map';

const MAPS = {
  ITHAN: 1,
  TORNEG: 2
}

export default async (io: any, socket: any) => {
  const currentMap = await Map.findOne({ where: { name: 'Torneg' }});
  const character = await Character.findByPk(1);
  
  socket.on('in-game', async (characterId: number) => {
    
  });
  
  socket.on('playerMove', async (key: string) => {
    if (!currentMap || !character) return;
    let positionChanged: void | 'x' | 'y';

    switch(key) {
      case 'w':
        if (character.positionY > 0) {
          character.positionY--;
          positionChanged = 'y';
        }
        break;
      case 'a':
        if (character.positionX > 0) {
          character.positionX--;
          positionChanged = 'x';
        }
        break;
      case 's':
        if (character.positionY < currentMap.height) {
          character.positionY++;
          positionChanged = 'y';
        }
        break;
      case 'd':
        if (character.positionX < currentMap.width) {
          character.positionX++;
          positionChanged = 'x';
        }
        break;
      default: throw new Error(`Invalid key ${key}`);
    }

    if (positionChanged != null) {
      io.emit('character', character.toJSON());
      await character.save();
    }
  });
  



  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
}