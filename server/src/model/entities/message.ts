import * as t from 'io-ts';

import { makeWithScheme } from '../db/makeWithScheme';

export const MessageScheme = t.type({
  id: t.number,
  text: t.string,
  timestamp: t.number,
  user_id: t.number,
  chat_id: t.number,
});

export type Message = t.TypeOf<typeof MessageScheme>;

export const withMessageScheme = makeWithScheme(MessageScheme, 'message');
