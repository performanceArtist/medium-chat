import { createApiClient } from './api/api-client';
import { AppContainer } from 'view/App/AppContainer';
import { createSocketClient } from 'api/socket-client';
import { createUserStore } from 'store/user.store';
import { createMessageStore } from 'store/message.store';
import { createChatStore } from 'store/chat.store';
import { useSubscription, withHook } from '@performance-artist/react-utils';
import { pipe } from 'fp-ts/lib/pipeable';

import { selector } from '@performance-artist/fp-ts-adt';
import { carrier } from '@performance-artist/medium';
import { makeAppSource } from 'view/App/app.source';
import { appMedium } from 'mediums/app.medium';

const WithEpic = pipe(
  selector.combine(AppContainer, appMedium),
  selector.map(([AppContainer, appMedium]) =>
    withHook(AppContainer)(() => {
      useSubscription(
        () => pipe(appMedium, carrier.merge, carrier.enclose),
        [],
      );

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
