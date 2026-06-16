const { Chess } = require('chess.js');
const Engine = require('./engine');

function classifyMove(cpLoss) {
  if (cpLoss <= 30) return 'Best/Good';
  if (cpLoss <= 130) return 'Inaccuracy';
  if (cpLoss <= 280) return 'Mistake';
  return 'Blunder';
}

const analyzeGame = async (pgn) => {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch (err) {
    throw new Error("Invalid PGN");
  }

  const engine = new Engine();
  engine.init();

  const history = chess.history({ verbose: true });
  const analysisResults = [];

  chess.reset();
  console.log(`🧠 Starting analysis of ${history.length} moves...`);

  let startEval;
  try {
    startEval = await engine.evaluatePosition(chess.fen(), 100);
  } catch (err) {
    console.error("Initial engine evaluation failed:", err);
    engine.quit();
    return;
  }

  let startScore = startEval.score;
  if (chess.turn() === 'b') {
    startScore = -startScore;
  }

  let prevEval = {
    bestMove: startEval.bestMove,
    score: startScore
  };

  for (const moveData of history) {
    const suggestedMoveUCI = prevEval.bestMove;
    let suggestedMoveSAN = null;

    if (suggestedMoveUCI) {
      try {
        const from = suggestedMoveUCI.substring(0, 2);
        const to = suggestedMoveUCI.substring(2, 4);
        const promotion = suggestedMoveUCI.length === 5 ? suggestedMoveUCI[4] : undefined;
        const moveObj = chess.move({ from, to, promotion });

        if (moveObj) {
          suggestedMoveSAN = moveObj.san;
          chess.undo();
        }
      } catch (err) {
        console.warn("Could not parse engine move:", suggestedMoveUCI);
      }
    }

    const scoreBefore = prevEval.score;
    chess.move(moveData.san);
    const currentFen = chess.fen();

    if (chess.isCheckmate()) {
      analysisResults.push({
        moveNumber: moveData.path,
        san: moveData.san,
        color: moveData.color,
        fen: currentFen,
        evaluation: moveData.color === 'w' ? 1000 : -1000,
        bestMove: suggestedMoveUCI,
        bestMoveSAN: suggestedMoveSAN,
        judgement: 'Best/Good'
      });
      break;
    }

    // --- FIXED VARIABLE SCOPING HERE ---
    let rawEval;
    try {
      rawEval = await engine.evaluatePosition(currentFen, 500);
    } catch (err) {
      console.error("ENGINE FAILED DURING LOOP:", err);
      // Ensure you close the engine process so it doesn't hang on Render
      engine.quit(); 
      
      // Your DB Fallback code:
      await db.query("UPDATE games SET status = 'FAILED' WHERE id = $1", [game.id]);
      await client.query("COMMIT");
      return;
    }

    let currentScore = rawEval.score;
    if (chess.turn() === 'b') {
      currentScore = -currentScore;
    }

    let cpLoss = 0;
    if (moveData.color === 'w') {
      cpLoss = (scoreBefore - currentScore) * 100;
    } else {
      cpLoss = (currentScore - scoreBefore) * 100;
    }

    if (cpLoss < 0) cpLoss = 0;

    analysisResults.push({
      moveNumber: moveData.path,
      san: moveData.san,
      color: moveData.color,
      fen: currentFen,
      evaluation: currentScore,
      bestMove: suggestedMoveUCI,
      bestMoveSAN: suggestedMoveSAN,
      judgement: classifyMove(cpLoss)
    });

    prevEval = {
      bestMove: rawEval.bestMove,
      score: currentScore
    };
  }

  engine.quit();
  return analysisResults;
};

module.exports = { analyzeGame };