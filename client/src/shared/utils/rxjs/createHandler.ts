import { Subject, Observable } from 'rxjs';

type Handler<T = void> = [
  Observable<T>,
  T extends void ? () => void : (value: T) => void,
];
export const createHandler = <T = void>(): Handler<T> => {
  const sub = new Subject<T>();
  const next = sub.next.bind(sub);

  return [sub.asObservable(), next as any];
};
