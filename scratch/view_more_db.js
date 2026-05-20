const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../asylen.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  }
});

db.all('SELECT * FROM property_gallery', [], (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Property Gallery:');
    console.log(JSON.stringify(rows, null, 2));
  }
});

db.all('SELECT * FROM site_settings', [], (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Site Settings keys:');
    rows.forEach(r => console.log(`- ${r.key}: ${r.value}`));
  }
  db.close();
});
