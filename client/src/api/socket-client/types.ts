import * as t from 'io-ts';
import { TypeOf } from 'io-ts';

export const MessageScheme = t.type({
  text: t.string,
  timestamp: t.number,
  user_id: t.number,
  chat_id: t.number,
});

export const channelToScheme = {
  message: MessageScheme,
};

export type ChannelToScheme = typeof channelToScheme;
export type SocketChannel = keyof ChannelToScheme;
export type SocketMessage = TypeOf<ChannelToScheme[SocketChannel]>;
export type MessageType = t.TypeOf<typeof MessageScheme>;
