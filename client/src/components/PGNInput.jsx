export default function PGNInput({ pgn, setPgn, onSubmit }) {
    return(
        <div className="pgn-input" >
          <textarea 
            rows="10"
            placeholder="Paste your PGN here"
            value={pgn}
            onChange={(e) => {setPgn(e.target.value)}}
          />

          <br/>

          <button onClick={onSubmit}>
            Analyze Game
          </button>
        </div>
    );
}