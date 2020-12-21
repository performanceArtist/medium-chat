import { pipe } from 'fp-ts/lib/pipeable';
import { either } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';
import { flow, not } from 'fp-ts/lib/function';

import { pick } from 'utils';

const makeValidator = <T>(
  validate: (o: { [key: string]: any }) => Either<string, T>,
) => (o: { [key: string]: any }) => validate(o);

const notNaN = flow(Number, not(Number.isNaN));

const checkInt = (input: any): Either<string, number> =>
  pipe(
    parseInt(input, 10),
    either.fromPredicate(notNaN, () => 'Expected a number'),
  );

export const chatID = makeValidator(
  flow(
    pick('chatID'),
    checkInt,
    either.mapLeft((e) => `Invalid chat id: ${e}`),
  ),
);
