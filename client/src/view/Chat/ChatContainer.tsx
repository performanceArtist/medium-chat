import { createElement, memo, useEffect, useMemo } from 'react';
import { pipe } from 'fp-ts/lib/function';
import { selector } from '@performance-artist/fp-ts-adt';
import { useBehavior } from '@performance-artist/react-utils';
import { chatMedium } from 'mediums/chat.medium';
import { log } from 'shared/utils/log';

import { Chat } from './Chat';
import { makeChatSource } from './chat.source';

export const ChatContainer = pipe(
  selector.combine(
    selector.defer(Chat, 'chatSource'),
    selector.defer(chatMedium, 'chatSource'),
    log,
  ),
  selector.map(([makeChat, chatMedium, log]) =>
    memo(() => {
      const chatSource = useMemo(() => makeChatSource(), []);
      log.useSource(chatSource);
      log.useMedium(chatMedium, { chatSource });

      useEffect(() => {
        chatSource.on.mount.next();
      }, []);

      const Chat = useMemo(() => makeChat.run({ chatSource }), []);

      const state = useBehavior(chatSource.state);

      return createElement(Chat, {
        chats: state.chats,
        onChatTabClick: chatSource.on.chatTabClick.next,
      });
    }),
  ),
);
