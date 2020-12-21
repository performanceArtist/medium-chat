import React, { memo, useCallback } from 'react';
import { Route, Switch, HashRouter, Redirect } from 'react-router-dom';
import { RequestResult, selector } from '@performance-artist/fp-ts-adt';

import { Preloader } from 'shared/ui/Preloader/Preloader';
import { LoginContainer } from 'view/Login/LoginContainer';
import { Authorized } from 'view/Authorized/Authorized';
import { RequestStateRenderer } from 'shared/ui/RequestState/RequestState';
import { pipe } from 'fp-ts/lib/pipeable';

type AppProps = {
  user: RequestResult<unknown>;
};

export const App = pipe(
  selector.combine(LoginContainer, Authorized),
  selector.map(([LoginContainer, Authorized]) =>
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
        <RequestStateRenderer
          data={user}
          onInitial={renderPending}
          onPending={renderPending}
          onError={renderError}
          onSuccess={renderSuccess}
        />
      );
    }),
  ),
);
