import './App.css'
import { useEffect, useState } from "react";
import { submitGame, getGame } from "./api/games";
import PGNInput from "./components/PGNInput";
import StatusPanel from "./components/StatusPanel";
import AnalysisView from "./components/AnalysisView";
import { Chessboard } from "react-chessboard"
import { Chess } from "chess.js"

function App() {
  const [pgn, setPgn] = useState('');
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [game, setGame] = useState(new Chess());
  const [selectedMove, setSelectedMove] = useState(null);
  const [moves, setMoves] = useState([]);
  const [moveIndex, setMoveIndex] = useState(-1);

  useEffect(() => {
    const getMoves = async () => {
        if (!jobId || status !== "COMPLETED") return;
        const data = await getGame(jobId);
        if (data.analysis && data.analysis.length > 0) {
            setMoves(data.analysis);
        }
    };
    getMoves();
  }, [jobId, status]);

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === "ArrowRight"){
        setMoveIndex((prev) => Math.min(prev + 1, moves.length - 1));
      }
      if (e.key === "ArrowLeft"){
        setMoveIndex((prev) => Math.max(prev - 1, -1));
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [moves]);

  useEffect(() => {
    if (moveIndex === -1){
      setGame(new Chess);
      setSelectedMove(null);
      return;
    }
    const move = moves[moveIndex];
    if (move){
      updatePosition({...move, arrowMove: moves[moveIndex + 1]?.bestMove ?? null});
    }
  }, [moveIndex, moves])

  const handleSubmit = async () => {
    const data = await submitGame(pgn);
    setJobId(data.jobId);
    setStatus(data.status);
  };

  useEffect(() => {
  if (!jobId || status === "COMPLETED") return;

  const interval = setInterval(async () => {
    try {
      const data = await getGame(jobId);
      setStatus(data.status);                  
      if (data.status === "COMPLETED") {
        console.log("Analysis:", data.analysis);
      }
    } catch (err) {
      console.error("Polling error:", err);
      setStatus("FAILED");
    }
  }, 2000);

  return () => clearInterval(interval);
  }, [jobId, status]);

  useEffect(() => {
    console.log("Board position updated to:", game);
  }, [game]);

  const updatePosition = (move) => {
    try{
      const newGame = new Chess(move.fen);
      setGame(newGame);
      setSelectedMove(move);
    } catch (e){
      console.error("Invalid fen. ", fen, e);
    }
  }

  const getBestMoveArrow = (move) => {
    if (!move || !move.arrowMove) return [];
    
    const from = move.arrowMove.slice(0, 2);
    const to = move.arrowMove.slice(2, 4);
    
    return [[from, to, 'rgb(0, 150, 0)']];
};

  return (
    <div>
      <header className="header">Chess Analysis</header>
      {!jobId && (
        <PGNInput pgn={pgn} setPgn={setPgn} onSubmit={handleSubmit} />
      )}

      <div className="analysis">
        <div className="board">
          <Chessboard position={game.fen()} arePiecesDraggable={false} customArrows={selectedMove ? getBestMoveArrow(selectedMove) : []} />
          <div className="lr-buttons">
            <button className="l-btn" onClick={() => setMoveIndex((prev) => Math.max(prev - 1, -1))}>⬅</button>
            <button className="r-btn" onClick={() => setMoveIndex((prev) => Math.min(prev + 1, moves.length - 1))}>➡</button>
          </div>
        </div>
        <div className="moves">
          {jobId && <AnalysisView moves={moves} moveIndex={moveIndex} onMoveSelect={setMoveIndex} />}
        </div>
      </div>
    </div>
  );
}

export default App;