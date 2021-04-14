import { pipe } from 'fp-ts/lib/pipeable';
import { effect } from '@performance-artist/medium';
import { switchMap } from 'rxjs/operators';
import * as rxo from 'rxjs/operators';
import { either } from 'fp-ts';
import * as rx from 'rxjs';

import { AppSource } from 'view/App/app.source';
import { UserStore } from 'store/user.store';
import { selector } from '@performance-artist/fp-ts-adt';

export type AppMediumDeps = {
  userStore: UserStore;
  appSource: AppSource;
};

export const appMedium = pipe(
  selector.keys<AppMediumDeps>()('appSource', 'userStore'),
  selector.map(deps => {
    const { userStore, appSource } = deps;

    const setUser = effect.branches(
      [
        appSource.on.login.value,
        appSource.on.logout.value,
        appSource.on.mount.value,
      ],
      ([loginEvent$, logoutEvent$, mountEvent$]) => {
        const login$ = pipe(
          loginEvent$,
          switchMap(userStore.login),
          rxo.filter(either.isRight),
        );

        const logout$ = pipe(
          logoutEvent$,
          switchMap(userStore.logout),
          rxo.filter(either.isRight),
        );

        return pipe(
          rx.merge(mountEvent$, login$, logout$),
          switchMap(userStore.getUser),
          effect.tag('setUser', user =>
            appSource.state.modify(state => ({ ...state, user })),
          ),
        );
      },
    );

    return { setUser };
  }),
);
