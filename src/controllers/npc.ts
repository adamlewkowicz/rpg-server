import {
  NpcDialogOpen,
  NpcDialogResponse,
  NpcShopTrade,
} from 'rpg-shared/action-types';
import {
  NPC_DIALOG_REQUEST, $_NPC_DIALOG_RESPONSE,
  NPC_SHOP_REQUEST, $_NPC_SHOP_RESPONSE,
  NPC_SHOP_TRADE
} from 'rpg-shared/dist/consts';
// import { Item } from 'rpg-shared/objects';

const dialogMock = {
  id: 1,
  npcId: 1,
  steps: [
    {
      id: 1,
      text: 'Have you seen my golden brancelet?',
      options: [
        { id: 1, text: 'Where have you seen it last time?' },
        { id: 2, text: 'I will try to find it for you.' }
      ],
      closeText: 'Sorry, I have no time.'
    }
  ]
}

const shopMock = {
  items: [
    {  }
  ]
}


export default async (io: any, socket: any, character: any) => {

  socket.on(NPC_DIALOG_REQUEST, (action: NpcDialogOpen, dispatch: any) => {
    dispatch({
      type: $_NPC_DIALOG_RESPONSE,
      payload: dialogMock
    });

    socket.on(NPC_SHOP_REQUEST, (action: any, dispatch: any) => {
      dispatch({
        type: $_NPC_SHOP_RESPONSE,
        payload: shopMock
      });

      socket.on(NPC_SHOP_TRADE, (action: NpcShopTrade, dispatch: any) => {
        /* Remove and add items to inventory */
      });
    });
  });
}