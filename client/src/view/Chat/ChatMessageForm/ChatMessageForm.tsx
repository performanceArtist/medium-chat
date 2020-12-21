import React, { memo, FormEvent } from 'react';

import './ChatMessageForm.scss';

type ChatMessageFormProps = {
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
};

export const ChatMessageForm = memo<ChatMessageFormProps>(props => {
  const { message, onMessageChange, onSubmit } = props;
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    onSubmit();
    onMessageChange('');
  };

  return (
    <form onSubmit={handleSubmit} className="chat-message-form">
      <input
        className="chat-message-form__input"
        value={message}
        onChange={e => onMessageChange(e.target.value)}
        type="text"
        placeholder="Your message"
      />
    </form>
  );
});
