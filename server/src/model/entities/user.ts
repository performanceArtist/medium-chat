import * as t from 'io-ts';

import { makeWithScheme } from '../db/makeWithScheme';

export const UserScheme = t.type({
  id: t.number,
  uid: t.string,
  username: t.string,
  avatar: t.string,
  email: t.string,
  password: t.string,
});

export type User = t.TypeOf<typeof UserScheme>;

export const withUserScheme = makeWithScheme(UserScheme, 'user');

export const comparePasswords = (candidate: string, actual: string) =>
  candidate === actual;
