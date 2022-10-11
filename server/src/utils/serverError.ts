export type ServerError = {
  type: 'serverError';
  error: Error;
};

export const serverError = (error: string): ServerError => ({
  type: 'serverError',
  error: new Error(error),
});

export const anyServerError = (data: unknown, meta?: string): ServerError =>
  serverError(
    JSON.stringify({
      data,
      meta,
    }),
  );

export const isServerError = (error: any): error is ServerError =>
  error['type'] === 'serverError';
