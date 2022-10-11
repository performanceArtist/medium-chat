import { pipe } from 'fp-ts/lib/pipeable';
import { either } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';
import { flow, not } from 'fp-ts/lib/function';

import { serverError, ServerError } from 'utils';

const makeValidator = <T>(
  validate: (o: { [key: string]: any }) => Either<ServerError, T>,
) => (o: { [key: string]: any }) => validate(o);

const notNaN = flow(Number, not(Number.isNaN));

const checkInt = (input: any): Either<string, number> =>
  pipe(
    parseInt(input, 10),
    either.fromPredicate(notNaN, () => 'Expected a number'),
  );

export const chatID = makeValidator(
  flow(
    ({ chatID }) => chatID,
    checkInt,
    either.mapLeft((e) => serverError(`Invalid chat id: ${e}`)),
  ),
);
