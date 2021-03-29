import { appMedium } from 'mediums/app.medium';
import { test } from '@performance-artist/medium';
import { makeAppSource } from 'view/App/app.source';
import { either } from 'fp-ts';
import {
  errorMock,
  makeMockUserStore,
  userMock,
  loginQueryMock,
} from 'store/mock/user.store.mock';

const withApp = test.withMedium(appMedium);

describe('App flow', () => {
  it(
    'Successful login and logout',
    withApp(
      () => ({
        appSource: makeAppSource(),
        userStore: makeMockUserStore({
          initialLoggedIn: false,
          isRightLogin: () => true,
          isRightLogout: () => true,
        }),
      }),
      ({ appSource }, history, output) => {
        appSource.dispatch('getUser')();
        expect(history.take()).toStrictEqual([output('setUser')(errorMock)]);

        appSource.dispatch('login')(loginQueryMock);
        expect(history.take()).toStrictEqual([
          output('setUser')(either.right(userMock)),
        ]);

        appSource.dispatch('logout')();
        expect(history.take()).toStrictEqual([output('setUser')(errorMock)]);
      },
    ),
  );

  it(
    'Successful logout if user is initially logged in',
    withApp(
      () => ({
        appSource: makeAppSource(),
        userStore: makeMockUserStore({
          initialLoggedIn: true,
          isRightLogin: () => true,
          isRightLogout: () => true,
        }),
      }),
      ({ appSource }, history, output) => {
        appSource.dispatch('getUser')();
        expect(history.take()).toStrictEqual([
          output('setUser')(either.right(userMock)),
        ]);

        appSource.dispatch('logout')();
        expect(history.take()).toStrictEqual([output('setUser')(errorMock)]);
      },
    ),
  );

  it(
    'Failed login',
    withApp(
      () => ({
        appSource: makeAppSource(),
        userStore: makeMockUserStore({
          initialLoggedIn: false,
          isRightLogin: () => false,
          isRightLogout: () => true,
        }),
      }),
      ({ appSource }, history, output) => {
        appSource.dispatch('getUser')();
        expect(history.take()).toStrictEqual([output('setUser')(errorMock)]);

        appSource.dispatch('login')(loginQueryMock);
        expect(history.take()).toStrictEqual([]);
      },
    ),
  );

  it(
    'Failed logout',
    withApp(
      () => ({
        appSource: makeAppSource(),
        userStore: makeMockUserStore({
          initialLoggedIn: true,
          isRightLogin: () => true,
          isRightLogout: () => false,
        }),
      }),
      ({ appSource }, history, output) => {
        appSource.dispatch('getUser')();
        expect(history.take()).toStrictEqual([
          output('setUser')(either.right(userMock)),
        ]);

        appSource.dispatch('logout')();
        expect(history.take()).toStrictEqual([]);
      },
    ),
  );
});
