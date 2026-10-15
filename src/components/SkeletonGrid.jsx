export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="event-grid" aria-busy="true" aria-label="Loading events">
      {Array.from({ length: count }, (_, i) => (
        <div className="event-card event-card--skeleton" key={i}>
          <div className="skeleton skeleton--media" />
          <div className="event-card__body">
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--short" />
          </div>
        </div>
      ))}
    </div>
  );
}
