import { Observable } from 'rxjs';
import { TypeOf } from 'io-ts';
import { selector } from '@performance-artist/fp-ts-adt';
import { pipe } from 'fp-ts/lib/pipeable';
import { either } from 'fp-ts';

import { createHandler } from 'shared/utils/rxjs';
import {
  channelToScheme,
  SocketChannel,
  SocketMessage,
  ChannelToScheme,
} from './types';

export type SocketClient = {
  subscribe: <T extends SocketChannel>(
    channel: T,
  ) => Observable<TypeOf<ChannelToScheme[T]>>;
  emit: (event: string, ...args: any[]) => void;
};

type AbstractSocket = {
  on: (event: string, f: (data: unknown) => void) => void;
  emit: (event: string, ...args: any[]) => void;
};

type Deps = {
  socket: AbstractSocket;
};

export const createSocketClient = pipe(
  selector.keys<Deps>()('socket'),
  selector.map(deps => (): SocketClient => {
    const { socket } = deps;

    const subscribe = (channel: SocketChannel) => {
      const [data$, handleMessage] = createHandler<SocketMessage>();
      const scheme = channelToScheme[channel];

      socket.on(channel, (data: unknown) => {
        const message = scheme.decode(data);

        if (either.isRight(message)) {
          handleMessage(message.right);
        } else {
          console.log('Unknown message:', message.left);
        }
      });

      return data$;
    };

    return {
      subscribe,
      emit: socket.emit,
    };
  }),
);
