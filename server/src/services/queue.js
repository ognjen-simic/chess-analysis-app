const db = require('../config/db');
const { analyzeGame } = require('./analyzer');

const POLLING_INTERVAL = 5000; 

async function processQueue() {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const res = await client.query(`
      SELECT * FROM games 
      WHERE status = 'QUEUED' 
      ORDER BY created_at ASC 
      LIMIT 1 
      FOR UPDATE SKIP LOCKED
    `);

    if (res.rows.length === 0) {
      client.query('COMMIT');
      return; 
    }

    const game = res.rows[0];
    console.log(`Worker: Found Job ${game.id}. Processing...`);

    await client.query(`UPDATE games SET status = 'PROCESSING' WHERE id = $1`, [game.id]);

    try {
      const results = await analyzeGame(game.pgn);
      await client.query(`
        UPDATE games 
        SET status = 'COMPLETED', analysis = $1 
        WHERE id = $2
      `, [JSON.stringify(results), game.id]);

      await client.query('COMMIT');

      console.log(`Worker: Job ${game.id} Finished!`);

    } catch (analysisErr) {
      console.error(`Analysis Failed for Job ${game.id}:`, analysisErr);
      
      await client.query('ROLLBACK');
      await db.query(`UPDATE games SET status = 'FAILED' WHERE id = $1`, [game.id]);
    }

  } catch (err) {
    client.query('ROLLBACK');
    console.error("Worker Error:", err);
  } finally{
    client.release();
  }
}

function startWorker() {
  console.log("Worker started. Polling for games...");
  processQueue();
  setInterval(processQueue, POLLING_INTERVAL);
}

module.exports = { startWorker };