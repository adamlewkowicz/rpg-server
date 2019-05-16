import {
  NpcDialogOpen, NpcDialogResponse,
  
  NPC_DIALOG_REQUEST, $_NPC_DIALOG_RESPONSE
} from 'rpg-shared/action-types';

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


export default async (io: any, socket: any, character: any) => {
  socket.on(NPC_DIALOG_REQUEST, (action: NpcDialogOpen, dispatch: any) => {
    dispatch({
      type: $_NPC_DIALOG_RESPONSE,
      payload: dialogMock
    });
  });
}