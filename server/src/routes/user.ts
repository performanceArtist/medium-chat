import { Router } from 'express';

import { startSocketIO } from 'middleware/io';
import { server } from '../server';

export const UserRouter = Router();

declare global {
  namespace Express {
    interface Request {
      io: any;
    }
  }
}

UserRouter.get('/me', (req, res) => {
  if (!req.user) {
    return res.sendStatus(500);
  }

  res.json(req.user);
});

UserRouter.get('/io', (req, res) => {
  req.io = startSocketIO(server);
  res.sendStatus(200);
});
