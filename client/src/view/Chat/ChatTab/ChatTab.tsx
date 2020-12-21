import React, { FC } from 'react';

import { Avatar } from 'view/Chat/Avatar/Avatar';
import './ChatTab.scss';

type ChatTabProps = {
  name: string;
  avatar: string;
  onClick: () => void;
};

export const ChatTab: FC<ChatTabProps> = props => {
  const { name, avatar, onClick } = props;

  return (
    <div className="chat-tab" onClick={onClick}>
      <div className="chat-tab__avatar">
        <Avatar image={avatar} />
      </div>
      <h3>{name}</h3>
    </div>
  );
};
