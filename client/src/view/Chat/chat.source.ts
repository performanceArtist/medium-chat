import { requestResult, RequestResult } from '@performance-artist/fp-ts-adt';
import { source, SourceOf } from '@performance-artist/medium';
import { Chat } from './Chat';
import { MessageType } from './ChatLayout/ChatLayout';

export type ChatUser = {
  id: number;
  username: string;
  avatar: string;
};

export type CurrentChat = {
  id: number;
  users: ChatUser[];
  messages: MessageType[];
};

export type ChatState = {
  chats: RequestResult<Chat[]>;
  currentChat: RequestResult<CurrentChat>;
  message: string;
  isChatOpen: boolean;
};

export const initialState: ChatState = {
  chats: requestResult.initial,
  currentChat: requestResult.initial,
  message: '',
  isChatOpen: false,
};

export type ChatSource = SourceOf<
  ChatState,
  {
    getChats: void;
    onChatTabClick: number;
    setMessage: string;
    onSubmit: void;
  }
>;

const set = source.setFor<ChatState>();
export const makeChatSource = (): ChatSource =>
  source.create(
    'chat',
    initialState,
  )({
    getChats: source.input(),
    onChatTabClick: source.input(),
    setMessage: set('message'),
    onSubmit: source.input(),
  });
