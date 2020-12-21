import { TypeC, TypeOf, array as IOArray } from 'io-ts';
import { failure } from 'io-ts/lib/PathReporter';
import { tryCatch, chainEitherK, TaskEither } from 'fp-ts/lib/TaskEither';
import { flow } from 'fp-ts/lib/function';
import { either } from 'fp-ts';

import { db } from './db';

const makeDBQuery = (query: string, params: any[], once = false) => {
  const exec = once ? db.get.bind(db) : db.all.bind(db);

  return tryCatch<Error, unknown>(
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
    (error: any) => {
      console.log(error);
      return error;
    },
  );
};

const makeWhereString = (where: { [key: string]: any }) => {
  return Object.entries(where)
    .map(([key, value], index) =>
      Array.isArray(value)
        ? index === 0
          ? `${key} IN(${value.join(',')})`
          : `AND ${key} IN(${value.join(',')})`
        : `${key}=?`,
    )
    .join(',');
};

type WithArray<T> = {
  [key in keyof T]: T[key][] | T[key];
};

export const makeWithScheme = <T extends TypeC<any>>(
  scheme: T,
  table: string,
) => {
  const makeSelect = <O extends boolean>(once: O) => (
    where: Partial<WithArray<TypeOf<T>>>,
    what?: keyof TypeOf<T>[],
  ): TaskEither<Error, O extends true ? TypeOf<T> : TypeOf<T>[]> => {
    const whatQuery = what ? (what as any).join(',') : '*';
    const whereQuery = makeWhereString(where);
    const sql = `SELECT ${whatQuery} from ${table} WHERE ${whereQuery}`;
    const data = makeDBQuery(sql, Object.values(where), once);
    const decode = once ? scheme.decode : IOArray(scheme).decode;
    const withError = flow(
      decode,
      either.mapLeft((errors) => new Error(failure(errors).join('\n'))),
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
      const whereQuery = makeWhereString(where);
      const setQuery = makeWhereString(updates);
      const sql = `UPDATE ${table} SET ${setQuery} WHERE ${whereQuery}`;

      return makeDBQuery(sql, [
        ...Object.values(updates),
        ...Object.values(where),
      ]);
    },
    remove: (where: Partial<TypeOf<T>>) => {
      const whereQuery = makeWhereString(where);
      const sql = `DELETE FROM ${table} WHERE ${whereQuery}`;

      return makeDBQuery(sql, Object.values(where));
    },
  };
};
