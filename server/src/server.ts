import http from 'http';
import cors from 'cors';
import express, { ErrorRequestHandler } from 'express';
import bodyParser from 'body-parser';
import { join } from 'path';
import session from 'express-session';
import SessionFileStore from 'session-file-store';
const FileStore = SessionFileStore(session);

import { useAuth } from './middleware/auth';
import { UserRouter } from './routes/user';
import { ChatRouter as makeChatRouter } from './routes/chat';
import { makeMessageService } from 'services/message';
import { chatService } from 'services/chat';

const app = express();

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'static')));

useAuth({
  app,
  sessionOptions: {
    secret: 'kek pok',
    cookie: {
      secure: false,
    },
    store: new FileStore({ path: 'src/model/sessions' }),
    resave: false,
    saveUninitialized: false,
  },
  onLogin: () => {
    const messageService = makeMessageService(server, '/user/io');
    const ChatRouter = makeChatRouter({
      messageService,
      chatService,
    });

    app.use('/chat', ChatRouter);
  },
});

app.use('/user', UserRouter);

const unknownErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
};

app.use(unknownErrorHandler);

const server = http.createServer(app).listen(5000, () => {
  console.log('Listening on port 5000');
});
