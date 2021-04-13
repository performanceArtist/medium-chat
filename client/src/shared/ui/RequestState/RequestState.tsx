import React from 'react';
import { RequestResult } from '@performance-artist/fp-ts-adt';
import { RequestStateRenderer } from '@performance-artist/react-utils';

import { Preloader } from '../Preloader/Preloader';

type RequestStateProps<T> = {
  data: RequestResult<T>;
  onSuccess: (result: T) => JSX.Element;
};

type RequestStateDefaults = {
  onError?: (error: Error) => JSX.Element;
  onPending?: () => JSX.Element;
  onInitial?: () => JSX.Element;
};

const onErrorDefault = (error: Error) => <h2>{error.toString()}</h2>;
const onPendingDefault = () => <Preloader />;
const onInitialDefault = () => <Preloader />;

export const makeRequestState = ({
  onError,
  onInitial,
  onPending,
}: RequestStateDefaults) =>
  function<T>({ data, onSuccess }: RequestStateProps<T>) {
    return (
      <RequestStateRenderer
        onError={onError || onErrorDefault}
        onPending={onPending || onPendingDefault}
        onInitial={onInitial || onInitialDefault}
        onSuccess={onSuccess}
        data={data}
      />
    );
  };

export const RequestState = makeRequestState({});
