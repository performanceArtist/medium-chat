import { scan, startWith } from 'rxjs/operators';
import * as t from 'io-ts';
import { Observable } from 'rxjs';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { makeMapStore } from '@performance-artist/rx-utils';

import { ApiClient, Request } from 'api/api-client';
import { MessageScheme, MessageType, SocketClient } from 'api/socket-client';

export type MessageQuery = {
  chatID: number;
  limit?: number;
  offset?: number;
};

export type SendQuery = { message: MessageType; room: string };

type MessageStoreDeps = {
  apiClient: ApiClient;
  socketClient: SocketClient;
};
export type MessageStore = {
  getMessagesByChat: (chatID: number) => Request<MessageType[]>;
  messages$: Observable<MessageType[]>;
  sendMessage: (query: SendQuery) => void;
};

type MakeMessageStore = () => MessageStore;

export const makeMessageStore = pipe(
  selector.keys<MessageStoreDeps>()('apiClient', 'socketClient'),
  selector.map(
    (deps): MakeMessageStore => () => {
      const { apiClient, socketClient } = deps;

      const messages$ = pipe(
        socketClient.subscribe('message'),
        scan<MessageType, MessageType[]>((acc, cur) => acc.concat(cur), []),
        startWith([]),
      );

      const store = makeMapStore<number, Request<MessageType[]>>();

      const getMessagesByChat = (chatID: number) =>
        store.getOrElse(chatID, () =>
          apiClient.get('chat/messages', {
            scheme: t.array(MessageScheme),
            query: { chatID },
          }),
        );

      const sendMessage = ({ message, room }: SendQuery) =>
        socketClient.emit('send', { message, room });

      return {
        getMessagesByChat,
        messages$,
        sendMessage,
      };
    },
  ),
);
