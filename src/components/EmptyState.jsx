export default function EmptyState({ title, children }) {
  return (
    <div className="state-box">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
