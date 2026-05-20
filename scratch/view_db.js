const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../asylen.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database.');
  }
});

db.all('SELECT * FROM properties', [], (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Properties:');
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});
