import { ExtendedSocket } from "../app";
import { MESSAGE_SEND, $_MESSAGE_RECEIVE } from "rpg-shared/dist/consts";
import { MessageSend, $MessageReceive, $SystemError } from 'rpg-shared/lib/action-types'
import { Dispatch } from "redux";
import { SYSTEM_ERROR } from "rpg-shared/lib/consts";

export default (
  io: SocketIO.Socket,
  socket: ExtendedSocket,
  { socketIds, currentLocationRoom }: ChatControllerProps
) => {

  socket.on(MESSAGE_SEND, async (
    action: MessageSend,
    dispatch: Dispatch<$SystemError>
  ) => {

    const nextAction: $MessageReceive = {
      type: $_MESSAGE_RECEIVE,
      payload: action.payload,
      meta: { to: action.meta.to }
    }

    switch(action.payload.type) {
      case 'PRIVATE':
        const receiverSocketId = socketIds.get(Number(action.meta.to));

        if (!receiverSocketId) {
          throw new Error(`Socket with id ${receiverSocketId} doesn't exists`);
        }

        io.to(receiverSocketId)
          .emit($_MESSAGE_RECEIVE, nextAction);
        break;

      case 'GROUP':
        const groupRoom = `group_${action.meta.to}`;
        socket
          .to(groupRoom)
          .emit($_MESSAGE_RECEIVE, nextAction);
        break;

      case 'LOCAL':
        socket
          .to(currentLocationRoom)
          .emit($_MESSAGE_RECEIVE, nextAction);
        break;

      default:
        dispatch({
          type: SYSTEM_ERROR,
          error: {
            message: `Invalid message type ${action.payload.type}`
          }
        });
    }
  });
}

interface ChatControllerProps {
  currentLocationRoom: string
  socketIds: Map<number, any>
}