import { useEffect, useState } from 'react';

// Text input that waits until the user stops typing before reporting the change.
// Keeps us well under Ticketmaster's rate limit while searching.
export default function DebouncedInput({ value, onCommit, delay = 500, ...props }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (local === value) return undefined;
    const timer = setTimeout(() => onCommit(local), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <input
      {...props}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onCommit(local);
        }
      }}
    />
  );
}
