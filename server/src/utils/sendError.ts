import { Response } from 'express';

export const sendError = (res: Response) => (
  error: string | Error,
  status = 500,
) => () => {
  console.log('Error:', error);
  res.status(status).send(typeof error === 'string' ? error : String(error));
};
