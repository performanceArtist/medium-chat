import { useSubscription, withHook } from '@performance-artist/react-utils';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { medium } from '@performance-artist/medium';

import { AppContainer } from 'view/App/AppContainer';
import { makeApiClient } from './api/api-client';
import { makeSocketClient } from 'api/socket-client';
import { makeUserStore } from 'store/user.store';
import { makeMessageStore } from 'store/message.store';
import { makeChatStore } from 'store/chat.store';
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
    makeApiClient,
    makeSocketClient,
  ),
  selector.map(([WithEpic, makeApiClient, makeSocketClient]) => {
    const apiClient = makeApiClient();
    const socketClient = makeSocketClient();

    const userStore = makeUserStore.run({ apiClient })();
    const messageStore = makeMessageStore.run({ apiClient, socketClient })();
    const chatStore = makeChatStore.run({ apiClient, socketClient })();

    return WithEpic.run({
      appSource: makeAppSource(),
      userStore,
      chatStore,
      messageStore,
    });
  }),
);
