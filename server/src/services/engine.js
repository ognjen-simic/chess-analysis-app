const { spawn } = require('child_process');
const path = require('path');

class Engine {
  constructor() {
    this.enginePath = process.platform === 'win32'
      ? path.resolve(__dirname, '../../bin/engine.exe')
      : path.resolve(__dirname, '../../bin/engine'); 
    this.process = null;
  }
  init() {
    this.process = spawn(this.enginePath);

    this.process.on('error', (err) => {
      console.error('❌ Failed to start engine. Is the path correct?', err);
    });
  }

  async evaluatePosition(fen, moveTimeMs = 500) {
    return new Promise((resolve, reject) => {
      if (!this.process) return reject(new Error("Engine not started"));

      const startTime = Date.now();

      this.process.stdin.write(`position fen ${fen}\n`);
      this.process.stdin.write(`go movetime ${moveTimeMs}\n`);

      let buffer = '';

      const listener = (data) => {
        buffer += data.toString();

        if (buffer.includes('bestmove')) {
          this.process.stdout.off('data', listener);
          const elapsed = Date.now() - startTime;
          console.log(`Engine took ${elapsed}ms (requested ${moveTimeMs}ms)`);
          const result = this.parseOutput(buffer);
          resolve(result);
        }
      };

      this.process.stdout.on('data', listener);
    });
  }

  parseOutput(output) {
    const lines = output.split('\n');
    let bestScore = 0;
    let bestMove = null;

    for (const line of lines) {
      if (line.startsWith('info') && line.includes('score')) {
        const parts = line.split(' ');
        const scoreIndex = parts.indexOf('score');
        const type = parts[scoreIndex + 1]; 
        const value = parseInt(parts[scoreIndex + 2]);

        if (type === 'cp') {
            bestScore = value / 100;
        } else if (type === 'mate') {
            bestScore = value > 0 ? 1000 : -1000;
        }
      }
      
      if (line.startsWith('bestmove')) {
        bestMove = line.split(' ')[1].trim();
      }
    }

    return { bestMove, score: bestScore };
  }

  quit() {
    if (this.process) {
      this.process.stdin.write('quit\n');
      this.process.kill();
    }
  }
}

module.exports = Engine;