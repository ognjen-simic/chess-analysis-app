const db = require('../src/config/db');

async function testConnection() {
  try {
    console.log("Connecting to Database...");
    
    const res = await db.query('SELECT NOW()');
    
    console.log("SUCCESS! Database Time:", res.rows[0].now);
    
    const tableCheck = await db.query("SELECT to_regclass('public.games');");
    if (tableCheck.rows[0].to_regclass) {
        console.log(" Table 'games' found.");
    } else {
        console.error("Table 'games' missing.");
    }

  } catch (err) {
    console.error("Connection Failed:", err.message);
  } finally {
    await db.pool.end();
  }
}

testConnection();