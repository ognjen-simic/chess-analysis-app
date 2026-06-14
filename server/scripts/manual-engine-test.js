const Engine = require('../src/services/engine');

async function test() {
  console.log("1. Initializing Engine...");
  const engine = new Engine();
  engine.init();

  console.log("2. Sending Start Position...");
  const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  
  try {
    const result = await engine.evaluatePosition(startFen, 1000);
    console.log("3. Result Received:");
    console.log(result);
    
    if (result.bestMove) {
        console.log("SUCCESS: Engine is working!");
    } else {
        console.log("ERROR: Engine returned no move.");
    }
  } catch (err) {
    console.error("CRITICAL FAILURE:", err);
  }

  engine.quit();
}

test();