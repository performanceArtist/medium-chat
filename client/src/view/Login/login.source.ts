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

export const makeLoginSource = (): LoginSource =>
  source.create(initialState, {
    setUsername: state => (username: string) => ({ ...state, username }),
    setPassword: state => (password: string) => ({ ...state, password }),
  });
