import {
  NPC_DIALOG_REQUEST, $_NPC_DIALOG_RESPONSE,
  NPC_SHOP_REQUEST, $_NPC_SHOP_RESPONSE,
  NPC_SHOP_TRADE, $_NPC_SHOP_TRADE, SYSTEM_ERROR
} from 'rpg-shared/dist/consts';
import * as Actions from 'rpg-shared/action-types/index';
import { Dispatch } from 'redux';
import { Socket } from 'socket.io'
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
    {
      id: 1,
      type: {
        id: 1,
        name: 'Sword',
        img: ''
      },
      price: 314,
      lvl: 12,
      damage: 41
    }
  ]
}


export default async (io: any, socket: Socket, character: any) => {

  socket.on(NPC_DIALOG_REQUEST, (action: Actions.NpcDialogRequest, dispatch: Dispatch) => {    
    dispatch({
      type: $_NPC_DIALOG_RESPONSE,
      payload: dialogMock
    });
  });


  socket.on(NPC_SHOP_TRADE, async (
    action: Actions.NpcShopTrade,
    dispatch: Dispatch<Actions.$NpcShopTrade>
  ) => {
    /* Remove and add items to inventory */
    dispatch({
      type: $_NPC_SHOP_TRADE
    });
  });


  socket.on(NPC_SHOP_REQUEST, (
    action: Actions.NpcShopRequest,
    dispatch: Dispatch<Actions.$NpcShopResponse>
  ) => {

    socket.broadcast.emit(SYSTEM_ERROR, {
      type: SYSTEM_ERROR,
      payload: 4,
      error: {
        fatal: false
      }
    } as Actions.$SystemError);

    dispatch({
      type: $_NPC_SHOP_RESPONSE,
      payload: shopMock
    });
  });
}