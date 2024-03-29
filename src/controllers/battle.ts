import uniqid from 'uniqid';
import { ExtendedSocket } from '../app';
import * as Actions from 'rpg-shared/lib/action-types'
import { FIGHT_START } from 'rpg-shared/lib/consts';

let charHP = 400;
let mobHP = 100;

export default (
  io: SocketIO.Server,
  socket: ExtendedSocket,
  character: any
) => {
  
  const battles: Battles = {};

  socket.on(FIGHT_START, (action: Actions.FightStart) => {
    const { targetId } = action.payload;
    const battleId = uniqid();
    const battleRoom = `battle__${battleId}`;
    battles[battleId] = { actions: [] };

    socket.join(battleRoom);

    /* Scaffold battle state - WIP */

    socket.on('FIGHT_ACTION', (action: any) => {
      /* Basic attack */
      charHP -= 50;
      mobHP -= 35;

      const nextTwoActions = [
        {
          target: 'MOB',
          targetId,
          result: { hp: mobHP }
        },
        {
          target: 'CHARACTER',
          targetId: character.id,
          result: { hp: charHP }
        }
      ];

      battles[battleId].actions = [
        ...battles[battleId].actions,
        ...nextTwoActions
      ]

      if (mobHP <= 0 || charHP <= 0) {
        io.in(battleRoom)
          .emit('$_FIGHT_FINISH', {
            type: '$_FIGHT_FINISH',
            payload: nextTwoActions
          });
        return;
      }

      io.in(battleRoom)
        .emit('$_FIGHT_ACTION_RESULT', {
          type: '$_FIGHT_ACTION_RESULT',
          payload: nextTwoActions
        });
    });
  });
}

interface BattleAction {
  targetType: 'MOB' | 'CHARACTER'
  targetId: number

}

interface Battle {
  actions: any[]
}

interface Battles {
  [battleId: string]: Battle
}