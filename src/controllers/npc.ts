

export default async (io: any, socket: any, character: any) => {
  socket.on('QUEST_DIALOG_TOGGLE', (action: any, dispatch: any) => {
    const { respondWith: type } = action.meta;

    const nextAction = {
      type,
      payload: { r: 44 }
    }
    
    dispatch(type, nextAction);
  });
}