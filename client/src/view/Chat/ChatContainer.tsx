import { createElement, memo, useEffect, useMemo } from 'react';
import { pipe } from 'fp-ts/lib/function';
import { selector } from '@performance-artist/fp-ts-adt';
import { useSubscription, useBehavior } from '@performance-artist/react-utils';

import { Chat } from './Chat';
import { makeChatSource } from './chat.source';
import { chatMedium } from 'mediums/chat.medium';
import { log } from 'shared/utils/log';

export const ChatContainer = pipe(
  selector.combine(
    selector.defer(Chat, 'chatSource'),
    selector.defer(chatMedium, 'chatSource'),
    log,
  ),
  selector.map(([makeChat, chatMedium, log]) =>
    memo(() => {
      const chatSource = useMemo(() => makeChatSource(), []);
      useSubscription(() => log.subscribeToSource(chatSource), [chatSource]);
      useSubscription(
        () => pipe(chatMedium.run({ chatSource }), log.runMedium),
        [chatSource, chatMedium],
      );

      useEffect(() => {
        chatSource.dispatch('getChats')();
      }, []);

      const Chat = useMemo(() => makeChat.run({ chatSource }), []);

      const state = useBehavior(chatSource.state);

      return createElement(Chat, {
        chats: state.chats,
        isChatOpen: state.isChatOpen,
        onChatTabClick: chatSource.dispatch('onChatTabClick'),
      });
    }),
  ),
);
