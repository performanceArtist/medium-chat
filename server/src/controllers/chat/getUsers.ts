import { chain } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';

import { pick } from 'utils';
import {
  withUserToChatScheme,
  UserToChat,
  withUserScheme,
} from 'model/entities';

const getUsers = (userToChat: UserToChat[]) =>
  withUserScheme.select({
    id: userToChat.map(pick('user_id')),
  });

export const getUsersByChat = (chatID: number) =>
  pipe(withUserToChatScheme.select({ chat_id: chatID }), chain(getUsers));
