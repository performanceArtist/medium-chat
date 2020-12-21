import { either } from 'fp-ts';
import { MessageStore } from 'store/message.store';
import * as rx from 'rxjs';

export const messageStoreMock: MessageStore = {
  getMessagesByChat: chatID => rx.of(either.right([])),
  messages$: rx.of([]),
  sendMessage: () => {},
};
