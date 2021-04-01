import { pipe } from 'fp-ts/lib/pipeable';
import { AnyAction, Source, carrier } from '@performance-artist/medium';
import { selector } from '@performance-artist/fp-ts-adt';
import { Ray } from '@performance-artist/medium/dist/ray/ray';
import {
  subscription,
  Subscription,
} from '@performance-artist/fp-ts-adt/dist/subscription';
import { flow } from 'fp-ts/lib/function';

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
    subscribeToSource: <S extends Source<any, any>>(s: S): Subscription =>
      logs.active ? s.action$.subscribe(logs.logSource) : subscription.empty,
    runMedium: flow(carrier.merge, all$ =>
      logs.active ? all$.subscribe(logs.logMedium) : all$.subscribe(),
    ),
  })),
);
