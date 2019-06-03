import {
  NPC_DIALOG_REQUEST, $_NPC_DIALOG_RESPONSE,
  NPC_SHOP_REQUEST, $_NPC_SHOP_RESPONSE,
  NPC_SHOP_TRADE, $_NPC_SHOP_TRADE, SYSTEM_ERROR
} from 'rpg-shared/dist/consts';
import * as Actions from 'rpg-shared/dist/action-types/index';
import { Dispatch } from 'redux';
import { Socket } from 'socket.io'
import { ExtendedSocket } from '../app';
import * as mocks from '../mocks';


export default async (
  io: SocketIO.Server,
  socket: ExtendedSocket,
  character: any
) => {

  socket.on(NPC_DIALOG_REQUEST, (action: Actions.NpcDialogRequest, dispatch: Dispatch) => {    
    dispatch({
      type: $_NPC_DIALOG_RESPONSE,
      payload: mocks.dialog
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
    dispatch({
      type: $_NPC_SHOP_RESPONSE,
      payload: mocks.shop
    });
  });
}