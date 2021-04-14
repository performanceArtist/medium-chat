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
import { createElement, memo, useMemo } from 'react';
import { appContext } from 'app-context/app-context';
import { tracedLog } from 'app-context/traced-logger/logger';
import { useSubscription } from '@performance-artist/react-utils';
import { source } from '@performance-artist/medium';
import { makeLoggerSource } from 'app-context/traced-logger/view/logger.source';

const WithSources = pipe(
  selector.combine(
    selector.defer(AppContainer, 'appSource'),
    selector.defer(appMedium, 'appSource'),
    appContext,
  ),
  selector.map(([makeAppContainer, appMedium, appContext]) =>
    memo(() => {
      const appSource = useMemo(makeAppSource, []);
      appContext.useSource(appSource);
      appContext.useMedium(appMedium, { appSource });
      const AppContainer = makeAppContainer.run({ appSource });

      return createElement(AppContainer);
    }),
  ),
);

const WithAppContext = pipe(
  selector.combine(
    selector.defer(WithSources, 'useMedium', 'useSource'),
    tracedLog,
  ),
  selector.map(([WithSources, { useMedium, useSource }]) =>
    WithSources.run({ useMedium, useSource }),
  ),
);

const WithLogSource = pipe(
  selector.defer(WithAppContext, 'loggerSource'),
  selector.map(Component =>
    memo(() => {
      const loggerSource = useMemo(makeLoggerSource, []);
      useSubscription(() => source.subscribe(loggerSource), [loggerSource]);

      return createElement(Component.run({ loggerSource }));
    }),
  ),
);

export const Root = pipe(
  selector.combine(
    selector.defer(WithLogSource, 'chatStore', 'messageStore', 'userStore'),
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
