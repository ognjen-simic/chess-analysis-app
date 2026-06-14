const db = require('../config/db');

const submitGame = async (req, res) => {
  try {
    const { pgn } = req.body; 

    if (!pgn) {
      return res.status(400).json({ error: "PGN is required" });
    }

    console.log("Received PGN:", pgn);

    const sql = `
      INSERT INTO games (pgn, status) 
      VALUES ($1, 'QUEUED') 
      RETURNING id`;
    
    const result = await db.query(sql, [pgn]);
    const newGameId = result.rows[0].id;

    console.log(`Game saved! ID: ${newGameId}`);

    res.status(202).json({ 
      message: "Game accepted for analysis", 
      jobId: newGameId,
      status: "QUEUED"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getGame = async (req, res) => {
  try{
    const {id} = req.params;

    const result = await db.query(
      'SELECT status, pgn, analysis FROM games WHERE id = $1', [id]
    );

    if (result.rows.length === 0){
      return res.status(404).json({error: 'Game not found'})
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Internal server error'})
  }
}

module.exports = {
  submitGame,
  getGame
};