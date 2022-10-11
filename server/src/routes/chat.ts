import { Router } from 'express';
import { pipe } from 'fp-ts/lib/pipeable';
import { either, reader } from 'fp-ts';

import { makeChatController } from 'controllers/chat';
import { sendError } from 'utils';

export const ChatRouter = pipe(
  makeChatController,
  reader.map((chatController) => {
    const ChatRouter = Router();

    ChatRouter.get('/all', (req, res) =>
      chatController
        .getChats(req)()
        .then(
          either.fold(sendError(res)('Failed to get chats'), (out) =>
            res.json(out),
          ),
        ),
    );

    ChatRouter.get('/users', (req, res) =>
      chatController
        .getUsers(req)()
        .then(
          either.fold(sendError(res)('Failed to get users'), (out) =>
            res.json(out),
          ),
        ),
    );

    ChatRouter.get('/messages', (req, res) =>
      chatController
        .getMessages(req)()
        .then(
          either.fold(sendError(res)('Failed to get messages'), (out) =>
            res.json(out),
          ),
        ),
    );

    ChatRouter.get('/send/:room', (req, res) =>
      chatController
        .sendMessage(req)()
        .then(
          either.fold(sendError(res)('Failed to send message'), () =>
            res.json('Ok'),
          ),
        ),
    );

    return ChatRouter;
  }),
);
