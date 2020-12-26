import { appMedium } from 'mediums/app.medium';
import { ray, test } from '@performance-artist/medium';
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
        logActive: false,
      }),
      ({ appSource }, history) => {
        appSource.dispatch('getUser')();
        expect(history.take()).toStrictEqual([
          ray.create('setUser$')(errorMock),
        ]);

        appSource.dispatch('login')(loginQueryMock);
        expect(history.take()).toStrictEqual([
          ray.create('setUser$')(either.right(userMock)),
        ]);

        appSource.dispatch('logout')();
        expect(history.take()).toStrictEqual([
          ray.create('setUser$')(errorMock),
        ]);
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
        logActive: false,
      }),
      ({ appSource }, history) => {
        appSource.dispatch('getUser')();
        expect(history.take()).toStrictEqual([
          ray.create('setUser$')(either.right(userMock)),
        ]);

        appSource.dispatch('logout')();
        expect(history.take()).toStrictEqual([
          ray.create('setUser$')(errorMock),
        ]);
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
        logActive: false,
      }),
      ({ appSource }, history) => {
        appSource.dispatch('getUser')();
        expect(history.take()).toStrictEqual([
          ray.create('setUser$')(errorMock),
        ]);

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
        logActive: false,
      }),
      ({ appSource }, history) => {
        appSource.dispatch('getUser')();
        expect(history.take()).toStrictEqual([
          ray.create('setUser$')(either.right(userMock)),
        ]);

        appSource.dispatch('logout')();
        expect(history.take()).toStrictEqual([]);
      },
    ),
  );
});
