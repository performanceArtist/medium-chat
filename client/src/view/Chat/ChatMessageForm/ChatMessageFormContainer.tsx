import { withHook, useBehavior } from '@performance-artist/react-utils';
import { ChatMessageForm } from './ChatMessageForm';
import { ChatSource } from '../chat.source';
import { selector } from '@performance-artist/fp-ts-adt';
import { pipe } from 'fp-ts/lib/pipeable';

type Deps = {
  chatSource: ChatSource;
};

export const ChatMessageFormContainer = pipe(
  selector.keys<Deps>()('chatSource'),
  selector.map(deps =>
    withHook(ChatMessageForm)(() => {
      const { chatSource } = deps;
      const state = useBehavior(chatSource.state);

      return {
        message: state.message,
        onMessageChange: chatSource.dispatch('setMessage'),
        onSubmit: chatSource.dispatch('onSubmit'),
      };
    }),
  ),
);
