export default function StatusPanel({ status, jobId }) {
  if (!status) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Status: {status}</h3>
      {jobId && <p>Job ID: {jobId}</p>}
    </div>
  );
}