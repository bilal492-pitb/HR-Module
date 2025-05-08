const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the database file
const dbPath = path.join(__dirname, '../../database.sqlite');

// Get database connection
function getDb() {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error connecting to database:', err.message);
      throw err;
    }
  });
}

// Run a query and get all results
function all(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all(query, params, (err, rows) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Run a query and get the first result
function get(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get(query, params, (err, row) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Run a query (insert, update, delete)
function run(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run(query, params, function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve({ 
          lastID: this.lastID, 
          changes: this.changes 
        });
      }
    });
  });
}

// Run multiple queries within a transaction
function transaction(queries) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      let results = [];
      let hasError = false;
      
      queries.forEach(({ query, params = [] }) => {
        if (hasError) return;
        
        db.run(query, params, function(err) {
          if (err) {
            hasError = true;
            db.run('ROLLBACK');
            db.close();
            reject(err);
          } else {
            results.push({ 
              lastID: this.lastID, 
              changes: this.changes 
            });
          }
        });
      });
      
      if (!hasError) {
        db.run('COMMIT', (err) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      }
    });
  });
}

// Export the database functions
module.exports = {
  getDb,
  all,
  get,
  run,
  transaction
}; 