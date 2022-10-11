import { RequestHandler } from 'express';
import { pipe } from 'fp-ts/lib/pipeable';
import { array, taskEither, either } from 'fp-ts';
import { flow } from 'fp-ts/lib/function';

import { sendError } from 'utils';
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

  const getChats: RequestHandler = (req, res) => {
    pipe(
      either.fromNullable('No user id')(req.user?.id),
      either.bimap(sendError(res), (userID) =>
        pipe(
          chatService.getChatsByUser(userID),
          taskEither.bimap(sendError(res)('Failed to get chats'), (chats) =>
            res.json(chats),
          ),
        )(),
      ),
    );
  };

  const getUsers: RequestHandler = (req, res) => {
    pipe(
      validate.chatID(req.query),
      either.bimap(sendError(res), (chatID) =>
        pipe(
          chatService.getUsersByChat(chatID),
          taskEither.bimap(
            sendError(res),
            flow(
              array.map(({ id, username, avatar }) => ({
                id,
                username,
                avatar,
              })),
              (users) => res.json({ chatID, users }),
            ),
          ),
        )(),
      ),
    );
  };

  const getMessages: RequestHandler = (req, res) => {
    pipe(
      validate.chatID(req.query),
      either.bimap(sendError(res), (chatID) =>
        pipe(
          chatService.getMessagesByChat(chatID),
          taskEither.bimap(sendError(res), (messages) => res.json(messages)),
        )(),
      ),
    );
  };

  const sendMessage: RequestHandler = (req, res) => {
    const { room } = req.params;
    const { message } = req.body;

    pipe(
      MessageScheme.decode(message),
      either.bimap(sendError(res)('Invalid message'), (message) => {
        messageService.sendMessage(room, message);
      }),
    );
  };

  return { getChats, getUsers, getMessages, sendMessage };
};
