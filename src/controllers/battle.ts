import uniqid from 'uniqid';

/* Scaffold battle engine */
class Battle {
  charHP: number;
  mobHP: number;
  
  constructor({ charHP, mobHP }: any) {
    this.charHP = 400;
    this.mobHP = 100;
  }

  characterAttacksMob() {
    return this.mobHP - 35;
  }

  mobAttacksCharacter() {
    const x = this.charHP - 50;
    return x;
  }
}

const battle = new Battle({});
let charHP = 400;
let mobHP = 100;

export default (io: any, socket: any, character: any) => {
  const battles: any = {};

  socket.on('FIGHT_START', (action: any) => {
    console.log({ action }, 'F')
    const { payload: mobId } = action;
    const battleId = uniqid();
    const battleRoom = `battle__${battleId}`;
    battles[battleId] = { actions: [] };

    socket.join(battleRoom);

    /* Scaffold battle state */
    

    socket.on('FIGHT_ACTION', (action: any) => {
      /* Basic attack */
      // const mobHP = battle.characterAttacksMob();
      // const charHP = battle.mobAttacksCharacter();
      charHP -= 50;
      mobHP -= 35;

      const nextTwoActions = [
        {
          target: 'MOB',
          targetId: mobId,
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
        io
          .in(battleRoom)
          .emit('$_FIGHT_FINISH', {
            type: '$_FIGHT_FINISH',
            payload: nextTwoActions
          });
        return;
      }

      io
        .emit('$_FIGHT_ACTION_RESULT', {
          type: '$_FIGHT_ACTION_RESULT',
          payload: nextTwoActions
        });
    });
  });
}