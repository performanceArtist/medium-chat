import React, { FC } from 'react';

import './Avatar.scss';

type AvatarProps = {
  image: string;
};

export const Avatar: FC<AvatarProps> = props => {
  const { image } = props;

  return (
    <div className="avatar">
      <img className="avatar__image" src={image} />
    </div>
  );
};
