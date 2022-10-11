import { Router } from 'express';
import { pipe } from 'fp-ts/lib/pipeable';
import { reader } from 'fp-ts';

import { makeChatController } from 'controllers/chat';

export const ChatRouter = pipe(
  makeChatController,
  reader.map((chatController) => {
    const ChatRouter = Router();

    ChatRouter.get('/all', chatController.getChats);
    ChatRouter.get('/users', chatController.getUsers);
    ChatRouter.get('/messages', chatController.getMessages);
    ChatRouter.post('/send/:room', chatController.sendMessage);

    return ChatRouter;
  }),
);
