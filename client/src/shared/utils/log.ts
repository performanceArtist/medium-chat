import { pipe } from 'fp-ts/lib/pipeable';
import { AnyAction, medium, Source, source } from '@performance-artist/medium';
import { selector } from '@performance-artist/fp-ts-adt';
import { Medium } from '@performance-artist/medium';
import { useSubscription } from '@performance-artist/react-utils';

type WithLoggerDeps = {
  logs: {
    active: boolean;
    logSource: (action: AnyAction) => void;
    logMedium: (action: AnyAction) => void;
  };
};

export const log = pipe(
  selector.keys<WithLoggerDeps>()('logs'),
  selector.map(({ logs }) => {
    const runSource = logs.active
      ? source.subscribeWith(logs.logSource)
      : source.subscribe;

    const runMedium = logs.active
      ? medium.subscribeWith(logs.logMedium)
      : medium.subscribe;

    const useSource = (s: Source<any, any>) => {
      useSubscription(() => runSource(s), [s]);
    };

    const useMedium = <E>(m: Medium<E, any>, e: E) =>
      useSubscription(() => pipe(m.run(e), runMedium), []);

    return {
      useSource,
      useMedium,
    };
  }),
);
