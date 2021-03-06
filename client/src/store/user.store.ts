import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { selector } from '@performance-artist/fp-ts-adt';

import { ApiClient, Request } from 'api/api-client';

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

type UserStoreDeps = {
  apiClient: ApiClient;
};

export type UserStore = {
  getUser: () => Request<User>;
  login: (query: LoginQuery) => Request<unknown>;
  logout: () => Request<unknown>;
};

type MakeUserStore = () => UserStore;

export const makeUserStore = pipe(
  selector.keys<UserStoreDeps>()('apiClient'),
  selector.map(
    (deps): MakeUserStore => () => {
      const { apiClient } = deps;

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
