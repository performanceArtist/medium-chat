import * as t from 'io-ts';

import { makeWithScheme } from '../db/makeWithScheme';

export const ChatScheme = t.type({
  id: t.number,
  name: t.string,
  description: t.string,
  avatar: t.string,
});

export type Chat = t.TypeOf<typeof ChatScheme>;

export const withChatScheme = makeWithScheme(ChatScheme, 'chat');
