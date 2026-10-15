export default function ErrorMessage({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state-box state-box--error" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
