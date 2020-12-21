import { Router } from 'express';
import { pipe } from 'fp-ts/lib/pipeable';
import { array, taskEither, either } from 'fp-ts';
import { flow } from 'fp-ts/lib/function';

import { pick, sendError } from 'utils';
import {
  getUsersByChat,
  getChatsByUser,
  getMessages,
  saveMessage,
} from 'controllers/chat';
import { MessageScheme } from 'model/entities';

import * as validate from './validators';

export const ChatRouter = Router();

ChatRouter.get('/all', (req, res) => {
  pipe(
    either.fromNullable('No user id')(req.user?.id),
    either.bimap(sendError(res), (userID) =>
      pipe(
        getChatsByUser(userID),
        taskEither.bimap(sendError(res)('Failed to get chats'), (chats) =>
          res.json(chats),
        ),
      )(),
    ),
  );
});

ChatRouter.get('/users', (req, res) => {
  pipe(
    validate.chatID(req.query),
    either.bimap(sendError(res), (chatID) =>
      pipe(
        getUsersByChat(chatID),
        taskEither.bimap(
          sendError(res),
          flow(array.map(pick('id', 'username', 'avatar')), (users) =>
            res.json({ chatID, users }),
          ),
        ),
      )(),
    ),
  );
});

ChatRouter.get('/messages', (req, res) => {
  pipe(
    validate.chatID(req.query),
    either.bimap(sendError(res), (chatID) =>
      pipe(
        getMessages(chatID),
        taskEither.bimap(sendError(res), (messages) => res.json(messages)),
      )(),
    ),
  );
});

ChatRouter.post('/send/:room', (req, res) => {
  const { room } = req.params;
  const { message } = req.body;

  pipe(
    MessageScheme.decode(message),
    either.bimap(sendError(res)('Invalid message'), (message) =>
      pipe(
        saveMessage(message),
        taskEither.bimap(sendError(res)('Failed to save a message'), () => {
          req.io.sockets.in(room).emit('message', { room, message });
          res.sendStatus(200);
        }),
      )(),
    ),
  );
});
