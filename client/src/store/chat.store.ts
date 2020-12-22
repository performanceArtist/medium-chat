import * as t from 'io-ts';
import { shareReplay } from 'rxjs/operators';
import { pipe } from 'fp-ts/lib/pipeable';
import { observableEither } from 'fp-ts-rxjs';
import { selector } from '@performance-artist/fp-ts-adt';
import { pick } from '@performance-artist/fp-ts-adt/dist/utils';
import { makeMapStore } from '@performance-artist/rx-utils';

import { SocketClient } from 'api/socket-client';
import { ApiClient, Request } from 'api/api-client';
import { User } from './user.store';

export const ChatScheme = t.type({
  id: t.number,
  name: t.string,
  description: t.string,
  avatar: t.string,
});

const ChatUserScheme = t.type({
  id: t.number,
  username: t.string,
  avatar: t.string,
});

const ChatUsersScheme = t.type({
  chatID: t.number,
  users: t.array(ChatUserScheme),
});

export type Chat = t.TypeOf<typeof ChatScheme>;
export type UsersByChat = t.TypeOf<typeof ChatUsersScheme>;

type ChatStoreDeps = {
  apiClient: ApiClient;
  socketClient: SocketClient;
};
export type ChatStore = {
  chats$: Request<Chat[]>;
  getUsersByChat: (chatID: number) => Request<User[]>;
  joinChat: (room: string) => void;
};

type CreateChatStore = () => ChatStore;

export const createChatStore = pipe(
  selector.keys<ChatStoreDeps>()('apiClient', 'socketClient'),
  selector.map(
    (deps): CreateChatStore => () => {
      const { apiClient, socketClient } = deps;

      const chats$ = pipe(
        apiClient.get('chat/all', { scheme: t.array(ChatScheme) }),
        shareReplay(1),
      );

      const store = makeMapStore<number, Request<User[]>>();

      const getUsersByChat = (chatID: number) =>
        store.getOrElse(chatID, () =>
          pipe(
            apiClient.get('chat/users', {
              scheme: ChatUsersScheme,
              query: { chatID },
            }),
            observableEither.map(pick('users')),
            shareReplay(1),
          ),
        );

      const joinChat = (room: string) => socketClient.emit('subscribe', room);

      return {
        chats$,
        getUsersByChat,
        joinChat,
      };
    },
  ),
);
