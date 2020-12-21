import { chain } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { pick } from 'utils';
import {
  withUserToChatScheme,
  UserToChat,
  withChatScheme,
} from 'model/entities';

const getChats = (userToChat: UserToChat[]) =>
  withChatScheme.select({
    id: userToChat.map(pick('chat_id')),
  });

export const getChatsByUser = (userID: number) =>
  pipe(withUserToChatScheme.select({ user_id: userID }), chain(getChats));
