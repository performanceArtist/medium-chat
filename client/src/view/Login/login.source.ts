import { source } from '@performance-artist/medium';

export type LoginState = {
  username: string;
  password: string;
};

export const initialState: LoginState = {
  username: '',
  password: '',
};

const set = source.setFor<LoginState>();
export const makeLoginSource = () =>
  source.create(
    'login',
    initialState,
  )({
    setUsername: set('username'),
    setPassword: set('password'),
  });

export type LoginSource = ReturnType<typeof makeLoginSource>;
