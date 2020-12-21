import { either } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { withHook, useBehavior } from '@performance-artist/react-utils';

import { ChatLayout } from './ChatLayout';
import { ChatSource } from '../chat.source';
import { AppSource } from 'view/App/app.source';

type Deps = {
  chatSource: ChatSource;
  appSource: AppSource;
};

export const ChatLayoutContainer = pipe(
  selector.combine(
    selector.keys<Deps>()('appSource', 'chatSource'),
    ChatLayout,
  ),
  selector.map(([deps, ChatLayout]) =>
    withHook(ChatLayout)(() => {
      const { appSource, chatSource } = deps;
      const state = useBehavior(chatSource.state);
      const appState = useBehavior(appSource.state);

      return {
        user: appState.user,
        chatUsers: pipe(
          state.currentChat,
          either.map(currentChat => currentChat.users),
        ),
        messages: pipe(
          state.currentChat,
          either.map(currentChat => currentChat.messages),
        ),
      };
    }),
  ),
);
