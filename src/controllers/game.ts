import { Character } from '../models/character';

const MAPS = {
  ITHAN: 1,
  TORNEG: 2
}

export default async (io: any, socket: any) => {
  let character: object|any;
  
  socket.on('in-game', async (characterId: number) => {
    character = await Character.findByPk(characterId);
    console.log(character)
  });


  
  socket.on('playerMove', async (key: string) => {
    switch(key) {
      case 'w':
        character.positionY--;
        break;
      case 'a':
        character.positionX--;
        break;
      case 's':
        character.positionY++;
        break;
      case 'd':
        character.positionX++;
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