import { selector } from '@performance-artist/fp-ts-adt';
import { useBehavior, withHook } from '@performance-artist/react-utils';
import { pipe } from 'fp-ts/lib/pipeable';
import { Logger } from './logger';
import { LoggerSource } from './logger.source';

type Deps = {
  loggerSource: LoggerSource;
};

export const LoggerContainer = pipe(
  selector.keys<Deps>()('loggerSource'),
  selector.map(deps =>
    withHook(Logger)(() => {
      const state = useBehavior(deps.loggerSource.state);

      return {
        sourceEntries: state.sourceEntries,
        mediumEntries: state.mediumEntries,
      };
    }),
  ),
);
