
export default (io: any, currentMap: any, character: any, socket: any, currentMapName: string) => async (key: string) => {
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
    /* Broadcast socket.broadcast.to(currentMap.name) */
    socket.emit('character', currentMap.name, character.toJSON());
    await character.save();
  }
}