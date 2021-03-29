import { pipe } from 'fp-ts/lib/pipeable';
import { medium, effect } from '@performance-artist/medium';
import { switchMap } from 'rxjs/operators';
import * as rxo from 'rxjs/operators';
import { either } from 'fp-ts';
import * as rx from 'rxjs';

import { AppSource } from 'view/App/app.source';
import { UserStore } from 'store/user.store';

export type AppMediumDeps = {
  userStore: UserStore;
  appSource: AppSource;
};

export const appMedium = medium.map(
  medium.id<AppMediumDeps>()('appSource', 'userStore'),
  (deps, on) => {
    const { userStore, appSource } = deps;

    const login$ = pipe(
      on(appSource.create('login')),
      switchMap(userStore.login),
      rxo.filter(either.isRight),
    );

    const logout$ = pipe(
      on(appSource.create('logout')),
      switchMap(userStore.logout),
      rxo.filter(either.isRight),
    );

    const setUser = pipe(
      rx.merge(on(appSource.create('getUser')), login$, logout$),
      switchMap(userStore.getUser),
      effect.tag('setUser', user =>
        appSource.state.modify(state => ({ ...state, user })),
      ),
    );

    return { setUser };
  },
);
