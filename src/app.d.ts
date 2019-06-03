import { Dispatch } from 'redux';
import * as types from 'rpg-shared/dist/consts';
import { ActionType } from 'rpg-shared/lib/action-type';
import { Socket } from 'socket.io';
import * as Actions from 'rpg-shared/lib/action-types'
import { ExtendedAction } from 'rpg-shared/lib/main';
import { Action } from 'rpg-shared/lib/main'



export interface ExtendedSocket extends Socket {
  broadcast: ExtendedSocket
  emit(event: ActionType, action: ExtendedAction): boolean
  to(roomName: string): ExtendedSocket
  on(event: ActionType, callback: (action: any, dispatch: Dispatch) => void): any;
  // on(event: ActionType, callback: (action: Action, store: any, dispatch: Dispatch) => void): any;
}