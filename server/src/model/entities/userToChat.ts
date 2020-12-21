import * as t from 'io-ts';

import { makeWithScheme } from '../db/makeWithScheme';

export const UserToChatScheme = t.type({
  id: t.number,
  user_id: t.number,
  chat_id: t.number,
});

export type UserToChat = t.TypeOf<typeof UserToChatScheme>;

export const withUserToChatScheme = makeWithScheme(
  UserToChatScheme,
  'user_chat',
);
