const sqlite3 = require('sqlite3').verbose();
const db = require('../db');

const Post = {
  getAll: (cb) => {
    db.all('SELECT * FROM posts', [], cb);
  },
  getById: (id, cb) => {
    db.get('SELECT * FROM posts WHERE id = ?', [id], cb);
  },
  create: (post, cb) => {
    db.run('INSERT INTO posts (name, numberOfPositions, grade, department, position, filled, vacant) VALUES (?, ?, ?, ?, ?, ?, ?)', [post.name, post.numberOfPositions, post.grade, post.department, post.position, post.filled, post.vacant], cb);
  },
  update: (id, post, cb) => {
    db.run('UPDATE posts SET name = ?, numberOfPositions = ?, grade = ?, department = ?, position = ?, filled = ?, vacant = ? WHERE id = ?', [post.name, post.numberOfPositions, post.grade, post.department, post.position, post.filled, post.vacant, id], cb);
  },
  delete: (id, cb) => {
    db.run('DELETE FROM posts WHERE id = ?', [id], cb);
  }
};

module.exports = Post;
