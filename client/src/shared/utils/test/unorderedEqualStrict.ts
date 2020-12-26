import { array, option } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';

export const unorderedEqualStrict = <T>(a: T[], b: T[]) =>
  a.length === b.length &&
  pipe(
    a,
    array.reduce(
      true,
      (acc, cur) =>
        acc &&
        pipe(
          b,
          array.findFirst(b => JSON.stringify(b) === JSON.stringify(cur)),
          option.fold(
            () => false,
            () => true,
          ),
        ),
    ),
  );
