import React from 'react';
import { RequestResult } from '@performance-artist/fp-ts-adt';

import { User } from 'shared/types';
import { withData } from 'shared/utils/react';

type ProfileProps = {
  user: RequestResult<User>;
};

export const Profile = withData<ProfileProps>()(['user'], data => {
  const { username, avatar } = data.user;

  return (
    <div className="profile">
      <h2>Profile</h2>
      <div>Username: {username}</div>
      <img src={avatar} />
    </div>
  );
});
