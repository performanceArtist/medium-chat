import React, { FC } from 'react';

type LogoutProps = {
  onLogout: () => void;
};

export const Logout: FC<LogoutProps> = props => {
  const { onLogout } = props;

  return (
    <button type="button" onClick={onLogout}>
      Log out
    </button>
  );
};
