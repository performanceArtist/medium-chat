import { Response } from 'express';
import { isServerError } from './serverError';

export const sendError = (res: Response) => (
  error: unknown,
  status = 500,
) => () => {
  console.log('Error:', error);
  const response = isServerError(error)
    ? 'Something went wrong'
    : String(error);
    
  res.status(status).send(response);
};
