import React, { memo, FormEvent } from 'react';

type LoginProps = {
  onUsernameChange: (username: string) => void;
  username: string;
  onPasswordChange: (password: string) => void;
  password: string;
  onSubmit: () => void;
};

export const Login = memo<LoginProps>(props => {
  const { username, onUsernameChange, password, onPasswordChange } = props;
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    props.onSubmit();
  };

  return (
    <form onSubmit={onSubmit}>
      Username
      <input
        name="username"
        type="text"
        value={username}
        onChange={e => onUsernameChange(e.target.value)}
      />
      Password
      <input
        name="password"
        type="password"
        value={password}
        onChange={e => onPasswordChange(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
});
