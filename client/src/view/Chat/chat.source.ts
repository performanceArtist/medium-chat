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
    chatTabClick: number;
    setMessage: string;
    submit: void;
  }
>;

export const makeChatSource = (): ChatSource =>
  source.create(initialState, {
    getChats: source.input(),
    chatTabClick: source.input(),
    setMessage: state => (message: string) => ({ ...state, message }),
    submit: source.input(),
  });
