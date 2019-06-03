import { Character } from "../models/Character";
import { ItemDrop, $ItemDroppedAdd, ItemPickup, $ItemDroppedRemove, $CharacterUpdate, CharacterUpdate } from "rpg-shared/lib/action-types";
import { $_ITEM_DROPPED_ADD, ITEM_DROP, ITEM_PICKUP, CHARACTER_UPDATE, $_CHARACTER_UPDATE } from "rpg-shared/lib/consts";
import { ExtendedSocket } from '../app';
import { Item } from "rpg-shared/lib/objects";
import { $_ITEM_DROPPED_REMOVE } from "rpg-shared/dist/consts";

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
        meta: { charId: character.id },
      });
  });

}

interface LocationControllerProps {
  currentLocationRoom: string
  character: Character
}