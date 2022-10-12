import { TypeC, TypeOf, array as IOArray } from 'io-ts';
import { failure } from 'io-ts/lib/PathReporter';
import { tryCatch, chainEitherK, TaskEither } from 'fp-ts/lib/TaskEither';
import { flow } from 'fp-ts/lib/function';
import { array, either } from 'fp-ts';

import { serverError, ServerError } from 'utils';
import { db } from './init';
import { pipe } from 'fp-ts/lib/pipeable';

const makeDBQuery = (query: string, params: any[], once = false) => {
  const exec = once ? db.get.bind(db) : db.all.bind(db);

  return tryCatch<ServerError, unknown>(
    () =>
      new Promise((resolve, reject) => {
        exec(query, params, (error: Error, result: unknown) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      }),
    (error) => {
      console.log(error);
      return serverError(String(error));
    },
  );
};

type WhereObject = Partial<WithArray<unknown>>;

const makeWhere = (where: WhereObject) => {
  const queryToValue: { query: string; value: unknown[] }[] = Object.entries(
    where,
  ).map(([key, value]) => {
    if (Array.isArray(value)) {
      return value.length === 1
        ? { query: `${key}=?`, value }
        : { query: `${key} IN(${value.map(() => '?').join(',')})`, value };
    } else {
      return { query: `${key}=?`, value: [value] };
    }
  });

  const query = pipe(
    queryToValue,
    array.map(({ query }) => query),
  ).join(' AND ');

  const values = pipe(
    queryToValue,
    array.chain(({ value }) => value),
  );

  return { query, values };
};

type WithArray<T> = {
  [key in keyof T]: T[key][] | T[key];
};

export const makeWithScheme = <T extends TypeC<any>>(
  scheme: T,
  table: string,
) => {
  const makeSelect = <O extends boolean>(once: O) => (
    where: Partial<WithArray<TypeOf<T>>> = {},
    what?: keyof TypeOf<T>[],
  ): TaskEither<ServerError, O extends true ? TypeOf<T> : TypeOf<T>[]> => {
    const whatQuery = what ? (what as any).join(',') : '*';
    const whereQuery = makeWhere(where);
    const sql =
      Object.keys(where).length === 0
        ? `SELECT ${whatQuery} from ${table}`
        : `SELECT ${whatQuery} from ${table} WHERE ${whereQuery.query}`;

    const data = makeDBQuery(sql, whereQuery.values, once);

    const decode = once ? scheme.decode : IOArray(scheme).decode;
    const withError = flow(
      decode,
      either.mapLeft((errors) => serverError(failure(errors).join('\n'))),
    );

    return chainEitherK(withError)(data) as any;
  };

  return {
    select: makeSelect(false),
    selectOne: makeSelect(true),
    insert: (row: TypeOf<T>) => {
      const values = [...'?'.repeat(Object.keys(scheme.props).length)].join(
        ',',
      );
      const sql = `INSERT INTO ${table} values(${values})`;
      const orderedValues = Object.keys(scheme.props).map((key) => row[key]);

      return makeDBQuery(sql, orderedValues);
    },
    update: (where: Partial<TypeOf<T>>, updates: Partial<TypeOf<T>>) => {
      const whereQuery = makeWhere(where);
      const setQuery = makeWhere(updates);
      const sql = `UPDATE ${table} SET ${setQuery.query} WHERE ${whereQuery.query}`;

      return makeDBQuery(sql, [...Object.values(updates), whereQuery.values]);
    },
    remove: (where: Partial<TypeOf<T>>) => {
      const whereQuery = makeWhere(where);
      const sql = `DELETE FROM ${table} WHERE ${whereQuery.query}`;

      return makeDBQuery(sql, whereQuery.values);
    },
  };
};
