import { Request } from 'express';
import { pipe } from 'fp-ts/lib/pipeable';
import { array, taskEither, either } from 'fp-ts';
import { serverError } from 'utils';
import { MessageScheme } from 'model/entities';

import * as validate from './validators';
import { MessageService } from 'services/message';
import { ChatService } from 'services/chat';

export type ChatControllerDeps = {
  messageService: MessageService;
  chatService: ChatService;
};

export const makeChatController = (deps: ChatControllerDeps) => {
  const { messageService, chatService } = deps;

  const getChats = (req: Request) =>
    pipe(
      either.fromNullable(serverError('No user id'))(req.user?.id),
      taskEither.fromEither,
      taskEither.chain(chatService.getChatsByUser),
    );

  const getUsers = (req: Request) =>
    pipe(
      validate.chatID(req.query),
      taskEither.fromEither,
      taskEither.bindTo('chatID'),
      taskEither.bind('users', ({ chatID }) =>
        pipe(
          chatService.getUsersByChat(chatID),
          taskEither.map(
            array.map(({ id, username, avatar }) => ({
              id,
              username,
              avatar,
            })),
          ),
        ),
      ),
    );

  const getMessages = (req: Request) =>
    pipe(
      validate.chatID(req.query),
      taskEither.fromEither,
      taskEither.chain(chatService.getMessagesByChat),
    );

  const sendMessage = (req: Request) => {
    const { room } = req.params;
    const { message } = req.body;

    return pipe(
      MessageScheme.decode(message),
      taskEither.fromEither,
      taskEither.map((message) => messageService.sendMessage(room, message)),
    );
  };

  return { getChats, getUsers, getMessages, sendMessage };
};
