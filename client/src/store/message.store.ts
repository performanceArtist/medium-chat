import { scan, startWith } from 'rxjs/operators';
import * as t from 'io-ts';
import { Observable } from 'rxjs';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { makeMapStore } from '@performance-artist/store';

import { apiClientKey, Request } from 'api/api-client';
import { socketClientKey, MessageScheme, MessageType } from 'api/socket-client';

export type MessageQuery = {
  chatID: number;
  limit?: number;
  offset?: number;
};

export type SendQuery = { message: MessageType; room: string };

export type MessageStore = {
  getMessagesByChat: (chatID: number) => Request<MessageType[]>;
  messages$: Observable<MessageType[]>;
  sendMessage: (query: SendQuery) => void;
};

type CreateMessageStore = () => MessageStore;

export const createMessageStore = pipe(
  selector.combine(apiClientKey, socketClientKey),
  selector.map(
    ([apiClient, socketClient]): CreateMessageStore => () => {
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
