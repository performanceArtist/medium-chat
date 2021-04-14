import React, { memo, useCallback } from 'react';
import { Route, Switch, HashRouter, Redirect } from 'react-router-dom';
import { RequestResult, selector } from '@performance-artist/fp-ts-adt';
import { RequestStateRenderer } from '@performance-artist/react-utils';
import { pipe } from 'fp-ts/lib/pipeable';

import { Preloader } from 'shared/ui/Preloader/Preloader';
import { LoginContainer } from 'view/Login/LoginContainer';
import { Authorized } from 'view/Authorized/Authorized';
import { LoggerContainer } from 'app-context/traced-logger/view/logger.container';

type AppProps = {
  user: RequestResult<unknown>;
};

export const App = pipe(
  selector.combine(LoginContainer, Authorized, LoggerContainer),
  selector.map(([LoginContainer, Authorized, LoggerContainer]) =>
    memo<AppProps>(props => {
      const { user } = props;

      const renderPending = useCallback(() => <Preloader />, []);
      const renderError = useCallback(
        () => (
          <HashRouter>
            <Switch>
              <Route path="/login" component={LoginContainer} />
              <Redirect to="/login" />
            </Switch>
          </HashRouter>
        ),
        [],
      );
      const renderSuccess = useCallback(
        () => (
          <HashRouter>
            <Authorized />
          </HashRouter>
        ),
        [],
      );

      return (
        <div style={{ display: 'flex' }}>
          <div style={{ maxWidth: 480, maxHeight: 600, overflow: 'scroll' }}>
            <LoggerContainer />
          </div>
          <RequestStateRenderer
            data={user}
            onInitial={renderPending}
            onPending={renderPending}
            onError={renderError}
            onSuccess={renderSuccess}
          />
        </div>
      );
    }),
  ),
);
