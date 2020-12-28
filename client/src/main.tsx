import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';

import { Root } from './Root';

const serverURL = 'http://localhost:5000/';
const ioClient = io(serverURL, { path: '/user/io' });
const socket = {
  on: ioClient.on.bind(ioClient),
  emit: ioClient.emit.bind(ioClient),
};

const Resolved = Root.run({
  api: {
    baseURL: serverURL,
    defaults: { withCredentials: true },
  },
  socket,
  logs: {
    active: true,
    logSource: ({ type, payload }) => console.log('[in]', type, payload),
    logMedium: ({ type, payload }) => console.log('[out]', type, payload),
  },
});

ReactDOM.render(<Resolved />, document.querySelector('#root'));
