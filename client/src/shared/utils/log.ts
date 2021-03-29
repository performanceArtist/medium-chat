import { record } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';
import { AnyAction, Source, carrier, ray } from '@performance-artist/medium';
import { Carrier } from '@performance-artist/medium/dist/carrier/carrier';
import { selector } from '@performance-artist/fp-ts-adt';
import { Ray } from '@performance-artist/medium/dist/ray/ray';
import { EffectTree } from '@performance-artist/medium/dist/effect/effect';

type WithLoggerDeps = {
  logs: {
    active: boolean;
    logSource: (action: AnyAction) => void;
    logMedium: (action: Ray<string, unknown>) => void;
  };
};

export const withMediumLog = pipe(
  selector.keys<WithLoggerDeps>()('logs'),
  selector.map(deps => <E, A extends EffectTree>(c: Carrier<E, A>) =>
    carrier.from({ ...c.sources, ...deps }, action$ => {
      const {
        logs: { active, logMedium },
      } = deps;
      const value = c.reflection(action$);

      return active
        ? (pipe(
            value,
            record.map(v => ({
              ...v,
              effect: payload => {
                logMedium(ray.create(v.tag as string)(payload));
                v.effect(payload);
              },
            })),
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
    ): S => {
      if (active) {
        s.action$.subscribe(logSource);
      }

      return s;
    },
  ),
);
