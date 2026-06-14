export default function AnalysisView({ moves, moveIndex, onMoveSelect }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <p>Moves:</p>
            {moves.length === 0 ? (
                <div className="spinner"></div>
            ) : moves.map((move, i) => (
                <div key={i} style={{
                    border: i === moveIndex ? "5px, solid, rgba(206, 21, 21, 1)" : "none",
                    backgroundColor: i % 2 === 0 ? 'white' : 'black',
                    color: i % 2 === 0 ? 'black' : 'white',
                    width: "90%", opacity: "85%",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "17px",
                    fontWeight: "bold",
                    padding: "5px  8px",
                    borderRadius: "8px"
                }}>
                    <button style={{
                        fontWeight: "bold",
                        width: "3rem",
                        height: "1.5rem",
                        fontSize: "15px",
                        border: i % 2 === 0 ? "2px, solid, black" : "2px, solid, white"
                    }}
                    onClick={() => onMoveSelect(i)}>
                        {move.san}
                    </button>
                    <span>{move.judgement}</span>
                    <span>{move.evaluation > 0 ? `+${move.evaluation}` : move.evaluation}</span>
                </div>
            ))}
        </div>
    );
}