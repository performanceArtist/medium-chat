import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';

import { apiClientKey, Request } from 'api/api-client';

const UserScheme = t.type({
  id: t.number,
  username: t.string,
  avatar: t.string,
});

export type User = t.TypeOf<typeof UserScheme>;
export type UserData = t.TypeOf<typeof UserScheme>;

export type LoginQuery = {
  username: string;
  password: string;
};

export type UserStore = {
  getUser: () => Request<User>;
  login: (query: LoginQuery) => Request<unknown>;
  logout: () => Request<unknown>;
};

type CreateUserStore = () => UserStore;

export const createUserStore = pipe(
  apiClientKey,
  selector.map(
    (apiClient): CreateUserStore => () => {
      const getUser = () => apiClient.get('user/me', { scheme: UserScheme });

      const login = (query: { username: string; password: string }) =>
        apiClient.post('login', { query });

      const logout = () => apiClient.post('logout');

      return {
        getUser,
        login,
        logout,
      };
    },
  ),
);
