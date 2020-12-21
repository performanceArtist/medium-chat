import React from 'react';
import { pipe } from 'fp-ts/lib/pipeable';
import { array, option, ord } from 'fp-ts';
import { ordNumber } from 'fp-ts/lib/Ord';
import { RequestResult, selector } from '@performance-artist/fp-ts-adt';
import { pick } from '@performance-artist/fp-ts-adt/dist/utils';

import { ChatMessageFormContainer } from 'view/Chat/ChatMessageForm/ChatMessageFormContainer';
import { useScroll, withData } from 'shared/utils/react';
import { ChatMessage } from 'view/Chat/ChatMessage/ChatMessage';
import { User } from 'shared/types';
import './ChatLayout.scss';

export type MessageType = {
  text: string;
  timestamp: number;
  user_id: number;
  chat_id: number;
};

type ChatLayoutProps = {
  user: RequestResult<User>;
  chatUsers: RequestResult<User[]>;
  messages: RequestResult<MessageType[]>;
};

export const ChatLayout = pipe(
  ChatMessageFormContainer,
  selector.map(ChatMessageFormContainer =>
    withData<ChatLayoutProps>()(['user', 'messages', 'chatUsers'], data => {
      const { user, chatUsers, messages } = data;
      const scrollToRef = useScroll<HTMLDivElement>(undefined, [data]);

      const sortedMessages = pipe(
        messages,
        array.sort(
          ord.contramap((message: MessageType) => message.timestamp)(ordNumber),
        ),
      );

      const getAvatar = (userID: number) =>
        pipe(
          chatUsers,
          array.findFirst(user => user.id === userID),
          option.map(pick('avatar')),
        );

      const renderedMessages = sortedMessages.map(
        ({ text, timestamp, user_id }) => (
          <ChatMessage
            key={`${user_id} ${timestamp}`}
            text={text}
            timestamp={timestamp}
            avatar={getAvatar(user_id)}
            isYours={user.id === user_id}
          />
        ),
      );

      const usernames = chatUsers.map(pick('username')).join(', ');

      return (
        <div className="chat-layout">
          <h3>Users: {usernames}</h3>
          <div className="chat-layout__messages">
            {renderedMessages}
            <div ref={scrollToRef} />
          </div>
          <div className="chat-layout__input-container">
            <ChatMessageFormContainer />
          </div>
        </div>
      );
    }),
  ),
);
