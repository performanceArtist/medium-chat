import { Express, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import SessionFileStore from 'session-file-store';
const FileStore = SessionFileStore(session);
import * as Either from 'fp-ts/lib/Either';
import { bimap } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
import { flow } from 'fp-ts/lib/function';

import { pick } from 'utils';

import {
  UserScheme,
  withUserScheme,
  comparePasswords,
} from 'model/entities/user';

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      avatar: string;
    }
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    (username, password, done) => {
      pipe(
        withUserScheme.selectOne({ username }),
        bimap(
          (error) => done(error),
          (user) =>
            comparePasswords(user.password, password)
              ? done(null, user)
              : done(new Error('Wrong password')),
        ),
      )();
    },
  ),
);

passport.serializeUser((user, done) => {
  Either.fold(
    (errors) => {
      console.log(errors);
      done(new Error('Invalid user'));
    },
    (user) => {
      done(null, (user as any).uid);
    },
  )(UserScheme.decode(user));
});

passport.deserializeUser((uid: string, done) => {
  pipe(
    withUserScheme.selectOne({ uid }),
    bimap(
      (error) => done(error),
      flow(pick('id', 'username', 'avatar'), (user) => done(null, user)),
    ),
  )();
});

export const useAuth = (app: Express) => {
  app.use(
    session({
      secret: 'kek pok',
      cookie: {
        secure: false,
      },
      store: new FileStore({ path: 'src/model/sessions' }),
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.post('/login', (req, res) => {
    passport.authenticate('local', (_, user) => {
      req.login(user, (error) => {
        if (error) {
          res.status(401).send(error);
        } else {
          res.status(200).send();
        }
      });
    })(req, res);
  });

  app.post('/logout', checkAuth, (req, res) => {
    req.logout();
    res.sendStatus(200);
  });

  app.use(checkAuth);
};

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(403);
  }
};
