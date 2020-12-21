import { AppSource } from 'view/App/app.source';
import { pipe } from 'fp-ts/lib/pipeable';
import { medium, ray } from '@performance-artist/medium';
import { switchMap } from 'rxjs/operators';
import * as rxo from 'rxjs/operators';
import { either } from 'fp-ts';
import { withLogger } from '@performance-artist/medium/dist/homs';

import { UserStore } from 'store/user.store';

export type AppMediumDeps = {
  userStore: UserStore;
  appSource: AppSource;
};

const rawAppMedium = medium.map(
  medium.id<AppMediumDeps>()('appSource', 'userStore'),
  (deps, on) => {
    const { userStore, appSource } = deps;

    const setUser$ = pipe(
      on(appSource.create('getUser')),
      switchMap(userStore.getUser),
      ray.infer(user => appSource.state.modify(state => ({ ...state, user }))),
    );

    const login$ = pipe(
      on(appSource.create('login')),
      switchMap(userStore.login),
      rxo.filter(either.isRight),
      rxo.mapTo(appSource.create('getUser')()),
    );

    const logout$ = pipe(
      on(appSource.create('logout')),
      switchMap(userStore.logout),
      rxo.filter(either.isRight),
      rxo.mapTo(appSource.create('getUser')()),
    );

    return { setUser$, login$, logout$ };
  },
);

export const appMedium = pipe(
  rawAppMedium,
  withLogger(({ type, payload }) => console.log('app', type, payload)),
);
