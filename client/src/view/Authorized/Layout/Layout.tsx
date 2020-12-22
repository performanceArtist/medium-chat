import { selector } from '@performance-artist/fp-ts-adt';
import { pipe } from 'fp-ts/lib/pipeable';
import React, { memo } from 'react';

import { LogoutContainer } from 'view/Authorized/Logout/LogoutContainer';
import './Layout.scss';

export const Layout = pipe(
  LogoutContainer,
  selector.map(LogoutContainer =>
    memo(props => {
      const { children } = props;

      return (
        <div className="layout">
          <header>
            <LogoutContainer />
          </header>
          <h1>WELCOME</h1>
          {children}
        </div>
      );
    }),
  ),
);
