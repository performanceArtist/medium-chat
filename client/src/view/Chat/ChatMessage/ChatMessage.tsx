import React, { FC } from 'react';
import { Option } from 'fp-ts/lib/Option';
import { option } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';

import { Avatar } from 'view/Chat/Avatar/Avatar';
import './ChatMessage.scss';

type ChatMessageProps = {
  avatar: Option<string>;
  text: string;
  timestamp: number;
  isYours?: boolean;
};

export const ChatMessage: FC<ChatMessageProps> = props => {
  const { avatar, text, isYours } = props;

  const imageUrl = pipe(
    avatar,
    option.getOrElse(() => ''),
  );

  if (isYours) {
    return (
      <div className="chat-message chat-message_yours">
        <div className="chat-message__content">{text}</div>
        <div className="chat-message__avatar">
          <Avatar image={imageUrl} />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-message">
      <div className="chat-message__avatar">
        <Avatar image={imageUrl} />
      </div>
      <div className="chat-message__content">{text}</div>
    </div>
  );
};
