import { Dispatch } from 'redux';
import * as types from 'rpg-shared/dist/consts';
import { ActionType } from 'rpg-shared/action-type';
import { Socket } from 'socket.io';
import * as Actions from 'rpg-shared/action-types'
import { ExtendedAction } from 'rpg-shared/main';
import { Action } from 'rpg-shared/main'



export interface ExtendedSocket extends NodeJS.EventEmitter {
  broadcast: ExtendedSocket
  emit(event: ActionType, action: ExtendedAction): boolean
  // on(event: ActionType, callback: (action: Action, store: any, dispatch: Dispatch) => void): any;
}