import { RequestResult, requestResult } from '@performance-artist/fp-ts-adt';
import { source } from '@performance-artist/medium';
import { User } from 'shared/types';

export type AppState = {
  user: RequestResult<User>;
};

export const initialState: AppState = {
  user: requestResult.initial,
};

export const makeAppSource = () =>
  source.create(
    'app',
    initialState,
  )({
    getUser: source.input<void>(),
    login: source.input<{ username: string; password: string }>(),
    logout: source.input<void>()
  });

export type AppSource = ReturnType<typeof makeAppSource>;
