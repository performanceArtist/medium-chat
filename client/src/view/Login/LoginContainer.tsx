import { Login } from './Login';
import { useBehavior, withHook } from '@performance-artist/react-utils';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { AppSource } from 'view/App/app.source';
import { useMemo } from 'react';
import { makeLoginSource } from './login.source';
import { appContext } from 'app-context/app-context';

type Deps = {
  appSource: AppSource;
};

export const LoginContainer = pipe(
  selector.combine(selector.keys<Deps>()('appSource'), appContext),
  selector.map(([deps, appContext]) =>
    withHook(Login)(() => {
      const { appSource } = deps;
      const loginSource = useMemo(() => makeLoginSource(), []);
      appContext.useSource(loginSource);
      const state = useBehavior(loginSource.state);

      return {
        username: state.username,
        onUsernameChange: loginSource.on.setUsername.next,
        onPasswordChange: loginSource.on.setPassword.next,
        password: state.password,
        onSubmit: () =>
          appSource.on.login.next({
            username: state.username,
            password: state.password,
          }),
      };
    }),
  ),
);
