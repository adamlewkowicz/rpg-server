import { Character } from '../../models/Character';
import { Map as Location } from '../../models/Map';
import { CharacterPosition } from '../../models/CharacterPosition';

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

const socketIds = new Map();

async function initGame() {
  console.log({ clientId });
  const character = await Character.findByPk(clientId);
  const position = await CharacterPosition.findOne({
    where: { charId: clientId },
    order: [['id', 'DESC']]
  });
  const currentMap = await Location.findByPk(1);
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

async function getDataForNextLocation(nextLocationId: number) {

  const [nextLocation, characters] = await Promise.all([
    Location.findByPk(nextLocationId),
    getCharsForLocationId(nextLocationId)
  ]);

  if (!nextLocation || !characters) {
    throw new Error(`Location probably doesnt exists - 404 - REQUEST_LOCATION_CHANGE`);
  }

  return { nextLocation, characters }
}

export default (io: any) => async (socket: any) => {
  clientId++;
  const { character, position, currentMap } = await initGame();

  if (!currentMap || !character || !position) {
    throw new Error('Server error');
  }
  let currentLocationId: number = currentMap.id;
  let currentLocationRoom: string = `location_${currentLocationId}`;
  let currentMapName = currentMap.name;
  const location = currentMap;
  const characters = await getCharsForLocationId(location.id);

  const char = { ...character.toJSON(), ...position.toJSON() };
  const charId: number = char.id;
  const socketId = socket.id;
  socketIds.set(charId, socketId);

  setTimeout(() => {
    socket.emit('LOAD_GAME', {
      type: 'LOAD_GAME',
      payload: { location, character: char, characters },
      meta: { io: false, clientId, currentLocationRoom, socketId }
    });
    socket.join(currentLocationRoom);
  }, 500);



  socket.on('REQUEST_LOCATION_CHANGE', async (action: any) => {
    const nextLocationId = action.payload;
    const nextLocationRoom = `location_${nextLocationId}`;

    socket.broadcast
      .to(currentLocationRoom)
      .emit(
        'CHARACTER_LEAVE',
        { type: 'CHARACTER_LEAVE', payload: charId },
        false
      );
    socket.leave(currentLocationRoom);

    const { nextLocation, characters } = await getDataForNextLocation(nextLocationId);

    socket.join(nextLocationRoom);
    socket.broadcast
      .to(nextLocationRoom)
      .emit(
        'CHARACTER_JOIN',
        { type: 'CHARACTER_JOIN', payload: char /* UNSAFE!! - get character from server's redux to make sure its position is correct */ },
        false
      );

    socket.emit('CHANGE_LOCATION', {
      type: 'CHANGE_LOCATION',
      payload: { location: nextLocation, characters }
    }, false);

    currentLocationId = nextLocation.id;
    currentLocationRoom = nextLocationRoom;
  });


  socket.on('CHARACTER_UPDATE', async (action: any) => {
    /* Third arg for stopping io propagation - equivalent for io: false */
    socket.broadcast.emit('CHARACTER_UPDATE', {
      ...action,
      meta: { ...action.meta, io: false }
    }, false);
  });

  
  /* Community */
  const MESSAGE_TYPES = {
    PRIVATE: 'PRIVATE',
    GROUP: 'GROUP',
    CLAN: 'CLAN',
    LOCAL: 'LOCAL',
    GLOBAL: 'GLOBAL'
  }

  socket.on('SEND_MESSAGE', async (action: any) => {

    const nextAction = {
      ...action,
      type: 'RECEIVE_MESSAGE',
      payload: {
        ...action.payload,
        fromSocketId: socketId,
        fromCharId: charId
      }
    }

    switch(action.payload.type) {
      case MESSAGE_TYPES.PRIVATE:
        io
          .to(action.payload.to)
          .emit('RECEIVE_MESSAGE', nextAction);
        break;
      default:
        socket
          .to(currentLocationRoom)
          .emit('RECEIVE_MESSAGE', nextAction);
    }
  });

  socket.on('disconnect', () => {
    onlinePlayers--;
    characterId--;
    clientId--;
    socketIds.delete(charId);
  });
}