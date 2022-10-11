import { Router } from 'express';

export const UserRouter = Router();

UserRouter.get('/me', (req, res) => {
  if (!req.user) {
    return res.sendStatus(500);
  }

  res.json(req.user);
});
