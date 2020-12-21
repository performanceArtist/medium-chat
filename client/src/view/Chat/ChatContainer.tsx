import { createElement, memo, useEffect, useMemo } from 'react';
import { pipe } from 'fp-ts/lib/function';
import { selector } from '@performance-artist/fp-ts-adt';
import { useSubscription, useBehavior } from '@performance-artist/react-utils';
import { medium } from '@performance-artist/medium';

import { Chat } from './Chat';
import { makeChatSource } from './chat.source';
import { chatMedium } from 'mediums/chat.medium';

export const ChatContainer = pipe(
  selector.combine(
    selector.defer(Chat, 'chatSource'),
    selector.defer(chatMedium, 'chatSource'),
  ),
  selector.map(([makeChat, chatMedium]) =>
    memo(() => {
      const chatSource = useMemo(() => makeChatSource(), []);
      useSubscription(() => pipe(chatMedium, medium.run({ chatSource })), [
        chatSource,
      ]);

      const state = useBehavior(chatSource.state);

      useEffect(() => {
        chatSource.dispatch('getChats')();
      }, []);

      const Chat = useMemo(() => makeChat.run({ chatSource }), []);

      return createElement(Chat, {
        chats: state.chats,
        isChatOpen: state.isChatOpen,
        onChatTabClick: chatSource.dispatch('onChatTabClick'),
      });
    }),
  ),
);
