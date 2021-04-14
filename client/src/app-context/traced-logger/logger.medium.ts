import { selector } from '@performance-artist/fp-ts-adt';
import { effect, medium, Source } from '@performance-artist/medium';
import { AnyAction } from '@performance-artist/medium';
import { record } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { LoggerSource } from './view/logger.source';

type LoggerDeps = {
  loggerSource: LoggerSource;
  logSource: (action: AnyAction) => void;
  logMedium: (action: AnyAction) => void;
};

export const fromSource = pipe(
  selector.keys<LoggerDeps>()('loggerSource', 'logMedium', 'logSource'),
  selector.map(deps => (s: Source<any, any>) => {
    const { loggerSource, logSource } = deps;

    const action$ = pipe(
      s.on,
      record.map(({ value }) => value),
      medium.mergeInputs,
    );

    const addLogEntry = pipe(
      action$,
      effect.partial(({ type, payload }) =>
        loggerSource.state.modify(state => ({
          ...state,
          sourceEntries: state.sourceEntries.concat({ tag: type, payload }),
        })),
      ),
    );

    const consoleLog = pipe(action$, effect.partial(logSource));

    return effect.tagObject({ addLogEntry, consoleLog });
  }),
);

export const fromMedium = medium.decorateAny(
  medium.id<LoggerDeps>()('loggerSource', 'logMedium', 'logSource'),
)((deps, [_, effects]) => {
  const { loggerSource, logMedium } = deps;
  const action$ = medium.mergeInputs(effects);

  const addLogEntry = pipe(
    action$,
    effect.partial(({ type, payload }) =>
      loggerSource.state.modify(state => ({
        ...state,
        mediumEntries: state.mediumEntries.concat({
          tag: String(type),
          payload,
        }),
      })),
    ),
  );

  const consoleLog = pipe(action$, effect.partial(logMedium));

  return effect.tagObject({ addLogEntry, consoleLog });
});
