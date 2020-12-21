import { requestResult, RequestResult } from '@performance-artist/fp-ts-adt';
import { source } from '@performance-artist/medium';
import { User } from 'shared/types';
import { Chat } from './Chat';
import { MessageType } from './ChatLayout/ChatLayout';

export type CurrentChat = {
  id: number;
  users: User[];
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

const set = source.setFor<ChatState>();
export const makeChatSource = () =>
  source.create(
    'chat',
    initialState,
  )({
    getChats: source.input<void>(),
    onChatTabClick: source.input<number>(),
    setMessage: set('message'),
    onSubmit: source.input<void>(),
  });

export type ChatSource = ReturnType<typeof makeChatSource>;
