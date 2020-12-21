import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';

import { AppSource } from 'view/App/app.source';
import { withHook, useBehavior } from '@performance-artist/react-utils';
import { Profile } from './Profile';

type Deps = {
  appSource: AppSource;
};

export const ProfileContainer = pipe(
  selector.keys<Deps>()('appSource'),
  selector.map(deps =>
    withHook(Profile)(() => {
      const { appSource } = deps;
      const appState = useBehavior(appSource.state);

      return { user: appState.user };
    }),
  ),
);
