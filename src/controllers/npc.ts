
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
  socket.on('QUEST_DIALOG_TOGGLE', (action: any, dispatch: any) => {
    const { respondWith: type } = action.meta;

    const nextAction = {
      type,
      payload: dialogMock
    }
    
    dispatch(type, nextAction);
  });
}