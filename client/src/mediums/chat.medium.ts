import { effect } from '@performance-artist/medium';
import { pipe } from 'fp-ts/lib/pipeable';
import {
  filter,
  map,
  switchMap,
  switchMapTo,
  withLatestFrom,
  distinctUntilChanged,
} from 'rxjs/operators';
import { array, either, option } from 'fp-ts';
import { observableEither } from 'fp-ts-rxjs';
import { sequenceT } from 'fp-ts/lib/Apply';
import { flow } from 'fp-ts/lib/function';

import { ChatStore } from 'store/chat.store';
import { ChatSource } from 'view/Chat/chat.source';
import { MessageStore } from 'store/message.store';
import { AppSource } from 'view/App/app.source';
import { selector } from '@performance-artist/fp-ts-adt';

export type ChatMediumDeps = {
  chatSource: ChatSource;
  appSource: AppSource;
  chatStore: ChatStore;
  messageStore: MessageStore;
};

export const chatMedium = pipe(
  selector.keys<ChatMediumDeps>()(
    'appSource',
    'chatSource',
    'chatStore',
    'messageStore',
  ),
  selector.map(deps => {
    const { chatSource, chatStore, messageStore, appSource } = deps;

    const setChats = pipe(
      chatSource.on.mount.value,
      effect.branch(
        flow(
          switchMapTo(chatStore.chats$),
          effect.tag('setChats', chats =>
            chatSource.state.modify(state => ({ ...state, chats })),
          ),
        ),
      ),
    );

    const joinChats = pipe(
      setChats,
      effect.branch(
        flow(
          filter(either.isRight),
          map(chats => chats.right),
          effect.tag('joinChats', chats =>
            chats.forEach(chat => chatStore.joinChat(chat.name)),
          ),
        ),
      ),
    );

    const setCurrentChat = pipe(
      chatSource.on.chatTabClick.value,
      effect.branch(
        flow(
          switchMap(chatID => {
            const users$ = chatStore.getUsersByChat(chatID);
            const stored$ = messageStore.getMessagesByChat(chatID);
            const sent$ = pipe(
              messageStore.messages$,
              map(
                flow(
                  array.filter(message => message.chat_id === chatID),
                  either.right,
                ),
              ),
            );
            const messages$ = pipe(
              sequenceT(observableEither.observableEither)(stored$, sent$),
              observableEither.map(([stored, sent]) => stored.concat(sent)),
            );

            return pipe(
              sequenceT(observableEither.observableEither)(users$, messages$),
              observableEither.map(([users, messages]) => ({
                id: chatID,
                users,
                messages,
              })),
              distinctUntilChanged(),
            );
          }),
          effect.tag('setCurrentChat', currentChat =>
            chatSource.state.modify(state => ({ ...state, currentChat })),
          ),
        ),
      ),
    );

    const sendMessage = pipe(
      chatSource.on.submit.value,
      effect.branch(
        flow(
          withLatestFrom(chatSource.state.value$, appSource.state.value$),
          map(([_, { chats, message, currentChat }, { user }]) =>
            pipe(
              sequenceT(either.either)(currentChat, chats, user),
              option.fromEither,
              option.chain(([currentChat, chats, user]) =>
                pipe(
                  chats,
                  array.findFirst(chat => chat.id === currentChat.id),
                  option.map(chat => ({
                    message: {
                      text: message,
                      chat_id: currentChat.id,
                      user_id: user.id,
                      timestamp: new Date().getTime(),
                    },
                    room: chat.name,
                  })),
                ),
              ),
            ),
          ),
          effect.tag(
            'sendMessage',
            query =>
              option.isSome(query) && messageStore.sendMessage(query.value),
          ),
        ),
      ),
    );

    return {
      setChats,
      joinChats,
      setCurrentChat,
      sendMessage,
    };
  }),
);
