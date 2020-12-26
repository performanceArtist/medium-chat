import { either } from 'fp-ts';
import * as rx from 'rxjs';

import { MessageStore } from 'store/message.store';

export const messageStoreMock: MessageStore = {
  getMessagesByChat: chatID => rx.of(either.right([])),
  messages$: rx.of([]),
  sendMessage: () => {},
};
