import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { Layout } from './Layout/Layout';
import { ProfileContainer } from 'view/Profile/ProfileContainer';
import { ChatContainer } from 'view/Chat/ChatContainer';
import { selector } from '@performance-artist/fp-ts-adt';
import { pipe } from 'fp-ts/lib/pipeable';

export const Authorized = pipe(
  selector.combine(ProfileContainer, ChatContainer, Layout),
  selector.map(([ProfileContainer, ChatContainer, Layout]) =>
    memo(() => (
      <Layout>
        <Switch>
          <Route exact path="/" component={ChatContainer} />
          <Route path="/profile" component={ProfileContainer} />
          <Redirect to="/" />
        </Switch>
      </Layout>
    )),
  ),
);
