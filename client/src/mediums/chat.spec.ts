import { test } from '@performance-artist/medium';
import * as rx from 'rxjs';
import { requestResult } from '@performance-artist/fp-ts-adt';

import { chatMedium } from 'mediums/chat.medium';
import { makeAppSource } from 'view/App/app.source';
import { makeChatSource } from 'view/Chat/chat.source';
import { chatStoreMock } from 'store/mock/chat.store.mock';
import { Chat } from 'store/chat.store';
import { messageStoreMock } from 'store/mock/message.store.mock';
import { option } from 'fp-ts';
import { User } from 'shared/types';

const withChat = test.withMedium(chatMedium);

const mockChat: Chat = {
  id: 1,
  name: 'chatName',
  description: '',
  avatar: '',
};
const mockChats = [mockChat];

const mockUser: User = { id: 2, username: '', avatar: '' };

jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime());

describe('Chat flow', () => {
  it(
    'Gets chats and joins them',
    withChat(
      () => ({
        appSource: makeAppSource(),
        chatSource: makeChatSource(),
        chatStore: {
          ...chatStoreMock,
          chats$: rx.of(requestResult.success(mockChats)),
        },
        messageStore: messageStoreMock,
      }),
      (deps, history, output) => {
        const { chatSource } = deps;

        chatSource.on.mount.next();
        expect(history.take()).toStrictEqual([
          output('setChats')(requestResult.success(mockChats)),
          output('joinChats')(mockChats),
        ]);

        chatSource.on.chatTabClick.next(1);
        expect(history.take()).toStrictEqual([
          output('setCurrentChat')(
            requestResult.success({
              id: mockChat.id,
              users: [],
              messages: [],
            }),
          ),
        ]);
      },
    ),
  );

  it(
    'Sends message to the current chat on submit',
    withChat(
      () => {
        const chatSource = makeChatSource();
        chatSource.state.modify(state => ({
          ...state,
          chats: requestResult.success(mockChats),
          currentChat: requestResult.success({
            id: mockChat.id,
            users: [],
            messages: [],
          }),
        }));

        const appSource = makeAppSource();
        appSource.state.modify(state => ({
          ...state,
          user: requestResult.success(mockUser),
        }));

        return {
          appSource,
          chatSource,
          chatStore: chatStoreMock,
          messageStore: messageStoreMock,
        };
      },
      (deps, history, output) => {
        const { chatSource } = deps;

        chatSource.on.setMessage.next('test');
        chatSource.on.submit.next();
        expect(history.take()).toStrictEqual([
          output('sendMessage')(
            option.some({
              room: mockChat.name,
              message: {
                chat_id: mockChat.id,
                user_id: mockUser.id,
                text: 'test',
                timestamp: new Date().getTime(),
              },
            }),
          ),
        ]);
      },
    ),
  );
});
