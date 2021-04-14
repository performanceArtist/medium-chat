import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';

import { AppContainer } from 'view/App/AppContainer';
import { makeApiClient } from './api/api-client';
import { makeSocketClient } from 'api/socket-client';
import { makeUserStore } from 'store/user.store';
import { makeMessageStore } from 'store/message.store';
import { makeChatStore } from 'store/chat.store';
import { makeAppSource } from 'view/App/app.source';
import { appMedium } from 'mediums/app.medium';
import { log } from 'shared/utils/log';
import { createElement, memo, useMemo } from 'react';

const WithSources = pipe(
  selector.combine(
    selector.defer(AppContainer, 'appSource'),
    selector.defer(appMedium, 'appSource'),
    log,
  ),
  selector.map(([makeAppContainer, appMedium, log]) =>
    memo(() => {
      const appSource = useMemo(makeAppSource, []);
      log.useSource(appSource);
      log.useMedium(appMedium, { appSource });
      const AppContainer = makeAppContainer.run({ appSource });

      return createElement(AppContainer);
    }),
  ),
);

export const Root = pipe(
  selector.combine(
    selector.defer(WithSources, 'chatStore', 'messageStore', 'userStore'),
    makeApiClient,
    makeSocketClient,
  ),
  selector.map(([WithSources, makeApiClient, makeSocketClient]) => {
    const apiClient = makeApiClient();
    const socketClient = makeSocketClient();

    const userStore = makeUserStore.run({ apiClient })();
    const messageStore = makeMessageStore.run({ apiClient, socketClient })();
    const chatStore = makeChatStore.run({ apiClient, socketClient })();

    return WithSources.run({
      userStore,
      chatStore,
      messageStore,
    });
  }),
);
