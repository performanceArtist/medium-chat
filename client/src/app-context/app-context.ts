import { selector } from '@performance-artist/fp-ts-adt';
import { Medium, Source } from '@performance-artist/medium';

export type Runners = {
  useSource: (s: Source<any, any>) => void;
  useMedium: <E>(m: Medium<E, any>, e: E) => void;
};

export type AppContext = Runners;

export const appContext = selector.keys<AppContext>()('useMedium', 'useSource');
