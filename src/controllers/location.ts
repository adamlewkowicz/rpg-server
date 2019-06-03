import { ItemDrop, $ItemDroppedAdd, ItemPickup, $ItemDroppedRemove, $CharacterUpdate, CharacterUpdate, LocationChangeRequest, $CharacterLeave, $CharacterJoin, $LocationChangeResponse } from "rpg-shared/lib/action-types";
import { $_ITEM_DROPPED_ADD, ITEM_DROP, ITEM_PICKUP, CHARACTER_UPDATE, $_CHARACTER_UPDATE, LOCATION_CHANGE_REQUEST, $_CHARACTER_LEAVE, CHARACTER_JOIN, $_CHARACTER_JOIN, $_LOCATION_CHANGE_RESPONSE } from "rpg-shared/lib/consts";
import { ExtendedSocket } from '../app';
import { Item, Character } from "rpg-shared/lib/objects";
import { $_ITEM_DROPPED_REMOVE, CHARACTER_LEAVE } from "rpg-shared/dist/consts";
import { Dispatch } from "redux";
import { getDataForNextLocation } from '../helpers';

const itemMock: Item = {
  id: 1,
  type: {
    id: 1,
    name: 'sword',
    img: ''
  },
  damage: 31
}

export default (
  io: SocketIO.Client,
  socket: ExtendedSocket,
  { currentLocationRoom, character }: LocationControllerProps
): void => {
  const charId = character.id;

  socket.on(ITEM_DROP, async (action: ItemDrop) => {
    socket
      .to(currentLocationRoom)
      .emit($_ITEM_DROPPED_ADD, <$ItemDroppedAdd> {
        type: $_ITEM_DROPPED_ADD,
        payload: itemMock
      });
  });
  

  socket.on(ITEM_PICKUP, async (action: ItemPickup) => {
    socket
      .to(currentLocationRoom)
      .emit($_ITEM_DROPPED_REMOVE, <$ItemDroppedRemove> {
        type: $_ITEM_DROPPED_REMOVE,
        meta: { itemId: action.meta.itemId }
      });
  });


  socket.on(CHARACTER_UPDATE, async (action: CharacterUpdate) => {
    socket.broadcast
      .emit($_CHARACTER_UPDATE, <$CharacterUpdate> {
        type: $_CHARACTER_UPDATE,
        payload: action.payload,
        meta: { charId },
      });
  });

  socket.on(LOCATION_CHANGE_REQUEST, async (
    action: LocationChangeRequest,
    dispatch: Dispatch<$LocationChangeResponse>
  ) => {
    const nextLocationId = action.meta.locationId;
    const nextLocationRoom = `location_${nextLocationId}`;

    socket.broadcast
      .to(currentLocationRoom)
      .emit($_CHARACTER_LEAVE, <$CharacterLeave> {
        type: $_CHARACTER_LEAVE,
        meta: { charId }
      });
    socket.leave(currentLocationRoom);

    const { nextLocation, characters } = await getDataForNextLocation(nextLocationId, charId);

    socket.join(nextLocationRoom);
    socket.broadcast
      .to(nextLocationRoom)
      .emit($_CHARACTER_JOIN, <$CharacterJoin> {
        type: $_CHARACTER_JOIN,
        /* Merge character's data with redis data to make sure it's valid and current */
        payload: character
      });

    dispatch({
      type: $_LOCATION_CHANGE_RESPONSE,
      payload: {
        location: nextLocation,
        characters
      }
    });

    // currentLocationId = nextLocation.id;
    currentLocationRoom = nextLocationRoom;
  });

}

interface LocationControllerProps {
  currentLocationRoom: string
  character: Character
}