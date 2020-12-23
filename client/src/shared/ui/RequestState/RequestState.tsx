import React from 'react';
import { RequestResult } from '@performance-artist/fp-ts-adt';
import { RequestStateRenderer } from '@performance-artist/react-utils';

import { Preloader } from '../Preloader/Preloader';

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
