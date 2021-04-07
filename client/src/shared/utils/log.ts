import { pipe } from 'fp-ts/lib/pipeable';
import { AnyAction, medium, source } from '@performance-artist/medium';
import { selector } from '@performance-artist/fp-ts-adt';
import { Ray } from '@performance-artist/medium/dist/ray/ray';

type WithLoggerDeps = {
  logs: {
    active: boolean;
    logSource: (action: AnyAction) => void;
    logMedium: (action: Ray<string, unknown>) => void;
  };
};

export const log = pipe(
  selector.keys<WithLoggerDeps>()('logs'),
  selector.map(({ logs }) => ({
    runSource: logs.active
      ? source.subscribeWith(logs.logSource)
      : source.subscribe,
    runMedium: logs.active
      ? medium.subscribeWith(logs.logMedium)
      : medium.subscribe,
  })),
);
