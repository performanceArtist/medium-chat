import socketIO from 'socket.io';
import { Server } from 'http';
import { pipe } from 'fp-ts/lib/pipeable';
import { map } from 'fp-ts/lib/TaskEither';

import { withMessageScheme } from 'model/entities';

export const startSocketIO = (server: Server) => {
  const io = socketIO(server, { path: '/user/io' });

  io.on('connection', (socket) => {
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
        map(() => {
          io.sockets.in(room).emit('message', message);
        }),
      )();
    });
  });

  return io;
};
