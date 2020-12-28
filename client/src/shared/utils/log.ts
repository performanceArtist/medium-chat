import { record } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import * as rxo from 'rxjs/operators';
import {
  AnyAction,
  Source,
} from '@performance-artist/medium/dist/source/model';
import {
  Carrier,
  CarrierOutput,
} from '@performance-artist/medium/dist/carrier/carrier';
import { selector } from '@performance-artist/fp-ts-adt';
import { carrier } from '@performance-artist/medium';
import { Ray } from '@performance-artist/medium/dist/ray/ray';

type WithLoggerDeps = {
  logs: {
    active: boolean;
    logSource: (action: AnyAction) => void;
    logMedium: (action: Ray<string, unknown>) => void;
  };
};

export const withMediumLog = pipe(
  selector.keys<WithLoggerDeps>()('logs'),
  selector.map(deps => <E, A extends CarrierOutput>(c: Carrier<E, A>) =>
    carrier.from({ ...c.sources, ...deps }, action$ => {
      const {
        logs: { active, logMedium },
      } = deps;
      const value = c.reflection(action$);

      return active
        ? (pipe(
            value,
            record.map(v => pipe(v, rxo.tap(logMedium))),
          ) as A)
        : value;
    }),
  ),
);

export const withSourceLog = pipe(
  selector.keys<WithLoggerDeps>()('logs'),
  selector.map(
    ({ logs: { active, logSource } }) => <S extends Source<any, any>>(
      s: S,
    ): S =>
      active
        ? {
            ...s,
            action$: pipe(s.action$, rxo.tap(logSource), rxo.shareReplay(1)),
          }
        : s,
  ),
);
