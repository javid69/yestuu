const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../asylen.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening DB:', err);
    return;
  }
  console.log('Opened database successfully.');

  // List all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Error listing tables:', err);
      return;
    }
    console.log('Tables in database:', tables.map(t => t.name));

    // If site_settings exists, list its keys
    if (tables.some(t => t.name === 'site_settings')) {
      db.all("SELECT key, value FROM site_settings", [], (err, rows) => {
        if (err) {
          console.error('Error reading site_settings:', err);
        } else {
          console.log('Site Settings keys:');
          rows.forEach(r => console.log(` - ${r.key}: ${r.value}`));
        }
        db.close();
      });
    } else {
      console.log('site_settings table DOES NOT exist!');
      db.close();
    }
  });
});
