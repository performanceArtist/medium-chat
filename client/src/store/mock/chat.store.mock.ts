import { ChatStore } from 'store/chat.store';
import * as rx from 'rxjs';
import { either } from 'fp-ts';

export const chatStoreMock: ChatStore = {
  chats$: rx.of(either.right([])),
  getUsersByChat: () => rx.of(either.right([])),
  joinChat: () => {},
};
