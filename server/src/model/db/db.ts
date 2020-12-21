import { Database } from 'sqlite3';

export const db = new Database('src/model/db/db.sqlite3', (error) => {
  if (error) {
    return console.error(error.message);
  }

  db.run(
    `CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid text,
    username text,
    avatar text,
    email text UNIQUE,
    password text,
    CONSTRAINT email_unique UNIQUE (email)
    CONSTRAINT uid UNIQUE (uid)
    )`,
    (err) => {
      if (err) {
        return;
      } else {
        const insert =
          'INSERT INTO user (id, uid, username, avatar, email, password) VALUES (?,?,?,?,?,?)';
        db.run(insert, [
          1,
          Math.random().toString(),
          'sherk',
          'shrek.jpeg',
          'test@example.com',
          'test',
        ]);
        db.run(insert, [
          2,
          Math.random().toString(),
          'BigChungmire',
          'ooo.png',
          'test1@example.com',
          'test',
        ]);
      }
    },
  );

  db.run(
    `CREATE TABLE chat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text,
    description text,
    avatar text
    )`,
    (err) => {
      if (err) {
        return;
      } else {
        const insert =
          'INSERT INTO chat (id,name, description, avatar) VALUES (?,?,?,?)';
        db.run(insert, [1, 'Chat1', 'test chat1', 'ooo.png']);
        db.run(insert, [2, 'Chat2', 'test chat2', 'ooo.png']);
      }
    },
  );

  db.run(
    `CREATE TABLE user_chat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    chat_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES user(id),
    FOREIGN KEY(chat_id) REFERENCES chat(id)
    )`,
    (err) => {
      if (err) {
        return;
      } else {
        const insert = 'INSERT INTO user_chat (user_id, chat_id) VALUES (?,?)';
        db.run(insert, [1, 1]);
        db.run(insert, [2, 1]);
      }
    },
  );

  db.run(
    `CREATE TABLE message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text text,
    timestamp INTEGER,
    user_id,
    chat_id,
    FOREIGN KEY(user_id) REFERENCES user(id),
    FOREIGN KEY(chat_id) REFERENCES chat(id)
    )`,
    (err) => {
      if (err) {
        return;
      } else {
        const insert =
          'INSERT INTO message (text, timestamp, user_id, chat_id) VALUES (?,?,?,?)';
        db.run(insert, ['shrek message', new Date().getTime(), 1, 1]);
        db.run(insert, ['chungmire message', new Date().getTime(), 2, 1]);
      }
    },
  );
});
