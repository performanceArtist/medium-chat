import React from 'react';
import { pipe } from 'fp-ts/lib/pipeable';
import { either } from 'fp-ts';
import {
  isPending,
  isInitial,
  RequestResult,
} from '@performance-artist/fp-ts-adt';

import { Preloader } from '../Preloader/Preloader';

type RequestStateRendererProps<T> = {
  data: RequestResult<T>;
  onInitial: () => JSX.Element;
  onSuccess: (result: T) => JSX.Element;
  onPending: () => JSX.Element;
  onError: (error: Error) => JSX.Element;
};

export function RequestStateRenderer<T>(props: RequestStateRendererProps<T>) {
  const { data, onSuccess, onError, onPending, onInitial } = props;

  return pipe(
    data,
    either.fold(left => {
      if (isPending(left)) {
        return onPending();
      } else if (isInitial(left)) {
        return onInitial();
      } else {
        return onError(left);
      }
    }, onSuccess),
  );
}

type RequestStateProps<T> = {
  data: RequestResult<T>;
  onSuccess: (result: T) => JSX.Element;
};

const onError = (error: Error) => <h2>{error.toString()}</h2>;
const onPending = () => <Preloader />;
const onInitial = () => <Preloader />;

export const RequestState = function<T>({
  data,
  onSuccess,
}: RequestStateProps<T>) {
  return (
    <RequestStateRenderer
      onError={onError}
      onPending={onPending}
      onInitial={onInitial}
      onSuccess={onSuccess}
      data={data}
    />
  );
};
