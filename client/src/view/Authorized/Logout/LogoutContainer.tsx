import { withHook } from '@performance-artist/react-utils';
import { Logout } from './Logout';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';
import { AppSource } from 'view/App/app.source';

type Deps = {
  appSource: AppSource;
};

export const LogoutContainer = pipe(
  selector.keys<Deps>()('appSource'),
  selector.map(deps =>
    withHook(Logout)(() => {
      const { appSource } = deps;

      return {
        onLogout: appSource.on.logout.next,
      };
    }),
  ),
);
