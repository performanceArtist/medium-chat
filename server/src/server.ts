import http from 'http';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import { join } from 'path';

import { useAuth } from './middleware/auth';
import { UserRouter } from './routes/user';
import { ChatRouter } from './routes/chat';

const app = express();

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(bodyParser.urlencoded({ extended: true }));
useAuth(app);

app.use(express.static(join(__dirname, 'static')));
app.use('/user', UserRouter);
app.use('/chat', ChatRouter);

export const server = http.createServer(app).listen(5000, () => {
  console.log('Listening on port 5000');
});
