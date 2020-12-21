import { withMessageScheme, Message } from 'model/entities';

export const saveMessage = (message: Message) =>
  withMessageScheme.insert(message);
