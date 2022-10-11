import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import {
  UserToChat,
  withChatScheme,
  withMessageScheme,
  withUserScheme,
  withUserToChatScheme,
} from 'model/entities';
import { ServerError } from 'utils';

export type ChatService = {
  getChatsByUser: (userID: number) => TaskEither<ServerError, Chat[]>;
  getMessagesByChat: (chatID: number) => TaskEither<ServerError, ChatMessage[]>;
  getUsersByChat: (chatID: number) => TaskEither<ServerError, ChatUser[]>;
};

export type Chat = {
  id: number;
  name: string;
  description: string;
  avatar: string;
};

export type ChatMessage = {
  id: number;
  text: string;
  timestamp: number;
  user_id: number;
  chat_id: number;
};

export type ChatUser = {
  id: number;
  uid: string;
  username: string;
  avatar: string;
  email: string;
  password: string;
};

const getChats = (userToChat: UserToChat[]) =>
  withChatScheme.select({
    id: userToChat.map(({ chat_id }) => chat_id),
  });

const getChatsByUser = (userID: number) =>
  pipe(
    withUserToChatScheme.select({ user_id: userID }),
    taskEither.chain(getChats),
  );

const getMessagesByChat = (chatID: number) =>
  withMessageScheme.select({ chat_id: chatID });

const getUsers = (userToChat: UserToChat[]) =>
  withUserScheme.select({
    id: userToChat.map(({ user_id }) => user_id),
  });

const getUsersByChat = (chatID: number) =>
  pipe(
    withUserToChatScheme.select({ chat_id: chatID }),
    taskEither.chain(getUsers),
  );

export const chatService: ChatService = {
  getChatsByUser,
  getMessagesByChat,
  getUsersByChat,
};
