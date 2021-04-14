import { pipe } from 'fp-ts/lib/pipeable';
import { AnyAction, medium, Source, source } from '@performance-artist/medium';
import { selector } from '@performance-artist/fp-ts-adt';
import { Medium } from '@performance-artist/medium';
import { useSubscription } from '@performance-artist/react-utils';
import { fromMedium, fromSource } from './logger.medium';
import { LoggerSource } from './view/logger.source';
import { useMemo } from 'react';

type WithTracedLoggerDeps = {
  logs: {
    active: boolean;
    logSource: (action: AnyAction) => void;
    logMedium: (action: AnyAction) => void;
  };
  loggerSource: LoggerSource;
};

export const tracedLog = pipe(
  selector.keys<WithTracedLoggerDeps>()('logs', 'loggerSource'),
  selector.map(deps => {
    const { logs, loggerSource } = deps;

    if (!logs.active) {
      const useSource = (s: Source<any, any>) => {
        useSubscription(() => source.subscribe(s), [s]);
      };

      const useMedium = <E>(m: Medium<E, any>, e: E) => {
        useSubscription(() => pipe(m.run(e), medium.subscribe), []);
      };

      return { useSource, useMedium };
    }

    const useSource = (s: Source<any, any>) => {
      const m = useMemo(
        () =>
          fromSource.run({
            loggerSource,
            logSource: logs.logSource,
            logMedium: logs.logMedium,
          })(s),
        [s],
      );

      useSubscription(() => pipe(m, medium.subscribe), []);
      useSubscription(() => source.subscribe(s), [s]);
    };

    const useMedium = <E>(m: Medium<E, any>, e: E) => {
      const em = useMemo(() => fromMedium(m), [m]);

      useSubscription(
        () => pipe(em, medium.run({ ...e, loggerSource } as any)),
        [],
      );
    };

    return { useSource, useMedium };
  }),
);
