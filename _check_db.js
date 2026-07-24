const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '.data', 'leguard.db');
console.log('DB path:', dbPath);

try {
  const db = new Database(dbPath);
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables:', tables.map(t => t.name));

  for (const t of tables) {
    const count = db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get();
    console.log(`${t.name}: ${count.c} rows`);
    if (count.c > 0) {
      const cols = db.prepare(`SELECT * FROM "${t.name}" LIMIT 3`).columns();
      const rows = db.prepare(`SELECT * FROM "${t.name}" LIMIT 5`).all();
      console.log('  Columns:', cols.map(c => c.name));
      console.log('  Sample:', JSON.stringify(rows, null, 2).slice(0, 500));
    }
  }

  // Search for narzo/realme in all tables
  for (const t of tables) {
    const cols = db.prepare(`SELECT * FROM "${t.name}" LIMIT 1`).columns();
    for (const col of cols) {
      if (['TEXT', 'VARCHAR', 'CHAR'].includes(col.type?.toUpperCase?.() || '')) {
        const rows = db.prepare(`SELECT * FROM "${t.name}" WHERE "${col.name}" LIKE '%narzo%' OR "${col.name}" LIKE '%realme%' OR "${col.name}" LIKE '%70 Turbo%'`).all();
        if (rows.length > 0) {
          console.log(`\nFound in ${t.name}.${col.name}:`, JSON.stringify(rows, null, 2));
        }
      }
    }
  }

  db.close();
} catch (e) {
  console.error('Error:', e.message);
}
