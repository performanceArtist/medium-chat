import { RequestResult, requestResult } from '@performance-artist/fp-ts-adt';
import { source, SourceOf } from '@performance-artist/medium';
import { User } from 'shared/types';

export type AppState = {
  user: RequestResult<User>;
};

export const initialState: AppState = {
  user: requestResult.initial,
};

export type AppSource = SourceOf<
  AppState,
  {
    getUser: void;
    login: { username: string; password: string };
    logout: void;
  }
>;

export const makeAppSource = (): AppSource =>
  source.create(initialState, {
    getUser: source.input(),
    login: source.input(),
    logout: source.input(),
  });
