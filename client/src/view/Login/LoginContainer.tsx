import { Login } from './Login';
import {
  useBehavior,
  useSubscription,
  withHook,
} from '@performance-artist/react-utils';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { AppSource } from 'view/App/app.source';
import { useMemo } from 'react';
import { makeLoginSource } from './login.source';
import { log } from 'shared/utils/log';

type Deps = {
  appSource: AppSource;
};

export const LoginContainer = pipe(
  selector.combine(selector.keys<Deps>()('appSource'), log),
  selector.map(([deps, log]) =>
    withHook(Login)(() => {
      const { appSource } = deps;
      const loginSource = useMemo(() => makeLoginSource(), []);
      useSubscription(() => log.subscribeToSource(loginSource), [loginSource]);
      const state = useBehavior(loginSource.state);

      return {
        username: state.username,
        onUsernameChange: loginSource.dispatch('setUsername'),
        onPasswordChange: loginSource.dispatch('setPassword'),
        password: state.password,
        onSubmit: () =>
          appSource.dispatch('login')({
            username: state.username,
            password: state.password,
          }),
      };
    }),
  ),
);
