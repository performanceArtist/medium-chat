import { source, SourceOf } from '@performance-artist/medium';

export type LoginState = {
  username: string;
  password: string;
};

export const initialState: LoginState = {
  username: '',
  password: '',
};

export type LoginSource = SourceOf<
  LoginState,
  {
    setUsername: string;
    setPassword: string;
  }
>;

const set = source.setFor<LoginState>();
export const makeLoginSource = (): LoginSource =>
  source.create(
    'login',
    initialState,
  )({
    setUsername: set('username'),
    setPassword: set('password'),
  });
