const { analyzeGame } = require('../src/services/analyzer');

async function test() {
  const pgn = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6";
  
  console.log("Analyzing...");
  try {
    const results = await analyzeGame(pgn);
    console.log("Analysis Complete!");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("Failed:", err);
  }
}

test();