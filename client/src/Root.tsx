import { useSubscription, withHook } from '@performance-artist/react-utils';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { medium } from '@performance-artist/medium';

import { AppContainer } from 'view/App/AppContainer';
import { createApiClient } from './api/api-client';
import { createSocketClient } from 'api/socket-client';
import { createUserStore } from 'store/user.store';
import { createMessageStore } from 'store/message.store';
import { createChatStore } from 'store/chat.store';
import { makeAppSource } from 'view/App/app.source';
import { appMedium } from 'mediums/app.medium';

const WithEpic = pipe(
  selector.combine(AppContainer, appMedium),
  selector.map(([AppContainer, appMedium]) =>
    withHook(AppContainer)(() => {
      useSubscription(() => medium.subscribe(appMedium), []);

      return {};
    }),
  ),
);

export const Root = pipe(
  selector.combine(
    selector.defer(
      WithEpic,
      'appSource',
      'chatStore',
      'messageStore',
      'userStore',
    ),
    createApiClient,
    createSocketClient,
  ),
  selector.map(([WithEpic, createApiClient, createSocketClient]) => {
    const apiClient = createApiClient();
    const socketClient = createSocketClient();

    const userStore = createUserStore.run({ apiClient })();
    const messageStore = createMessageStore.run({ apiClient, socketClient })();
    const chatStore = createChatStore.run({ apiClient, socketClient })();

    return WithEpic.run({
      appSource: makeAppSource(),
      userStore,
      chatStore,
      messageStore,
    });
  }),
);
