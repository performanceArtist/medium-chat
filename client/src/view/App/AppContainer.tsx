import { selector } from '@performance-artist/fp-ts-adt';
import { pipe } from 'fp-ts/lib/pipeable';
import { useEffect } from 'react';
import { useBehavior, withHook } from '@performance-artist/react-utils';

import { AppSource } from 'view/App/app.source';
import { App } from './App';

type Deps = {
  appSource: AppSource;
};

export const AppContainer = pipe(
  selector.combine(selector.keys<Deps>()('appSource'), App),
  selector.map(([deps, App]) =>
    withHook(App)(() => {
      const { appSource } = deps;

      const state = useBehavior(appSource.state);

      useEffect(() => {
        appSource.dispatch('getUser')();
      }, []);

      return { user: state.user };
    }),
  ),
);
