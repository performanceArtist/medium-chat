import { Option, some, none } from 'fp-ts/lib/Option';

export const withNumbers = (query: any, assert: string[]): Option<object> => {
  const numbers = assert.reduce((acc, key) => {
    const number = parseFloat(query[key]);
    if (Number.isNaN(number)) {
      return none;
    }

    acc[key] = number;
  }, {} as any);

  return some({ ...query, ...numbers });
};
