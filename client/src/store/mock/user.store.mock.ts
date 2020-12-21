import * as rx from 'rxjs';
import { either } from 'fp-ts';

import { UserStore, User, LoginQuery } from '../user.store';

export const userMock: User = { id: 0, username: '', avatar: '' };

export const loginQueryMock: LoginQuery = { username: '', password: '' };

export const errorMock = either.left(({} as any) as Error);

export const successMock = either.right(undefined);

export type MockOptions = {
  initialLoggedIn: boolean;
  isRightLogin: (query: LoginQuery) => boolean;
  isRightLogout: () => boolean;
};

export const makeMockUserStore = (options: MockOptions): UserStore => {
  const { initialLoggedIn, isRightLogin, isRightLogout } = options;
  let loggedIn = initialLoggedIn;

  return {
    getUser: () =>
      loggedIn ? rx.of(either.right(userMock)) : rx.of(errorMock),
    login: query => {
      if (isRightLogin(query)) {
        loggedIn = true;
        return rx.of(successMock);
      } else {
        return rx.of(errorMock);
      }
    },
    logout: () => {
      if (isRightLogout()) {
        loggedIn = false;
        return rx.of(successMock);
      } else {
        return rx.of(errorMock);
      }
    },
  };
};
