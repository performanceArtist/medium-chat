import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { Server } from 'http';
import { withMessageScheme } from 'model/entities';
import socketIO from 'socket.io';

export type MessageService = {
  sendMessage: (room: string, message: Message) => void;
};

export type Message = {
  id: number;
  text: string;
  timestamp: number;
  user_id: number;
  chat_id: number;
};

export type MessageServiceError = { type: 'socketError' };

export const makeMessageService = (
  httpServer: Server,
  path: string,
): MessageService => {
  const ioServer = socketIO(httpServer, { path });

  ioServer.on('connection', (socket) => {
    socket.on('subscribe', (room: string) => {
      console.log('Subscribe to ', room);
      socket.join(room);
    });

    socket.on('unsubscribe', (room: string) => {
      socket.leave(room);
    });

    socket.on('send', (data: any) => {
      const { message, room } = data;

      pipe(
        withMessageScheme.insert(message),
        taskEither.map(() => {
          ioServer.sockets.in(room).emit('message', message);
        }),
      )();
    });
  });

  return {
    sendMessage: (room, message) =>
      ioServer.sockets.in(room).emit('message', { room, message }),
  };
};
