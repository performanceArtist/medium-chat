import { chatMedium } from 'mediums/chat.medium';
import { test } from '@performance-artist/medium';

const withChat = test.withMedium(chatMedium);
console.log(withChat);

describe('Chat flow', () => {
  it('todo', () => {
    expect(true).toBe(true);
  });
});
