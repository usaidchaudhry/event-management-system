import { useState } from 'react';

// Two-step button so a registration is never cancelled by an accidental click.
export default function CancelRegistrationButton({ onConfirm, label = 'Cancel registration' }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" className="btn btn--danger-outline" onClick={() => setConfirming(true)}>
        {label}
      </button>
    );
  }

  return (
    <span className="confirm-group" role="group" aria-label="Confirm cancellation">
      <button type="button" className="btn btn--danger" onClick={onConfirm} autoFocus>
        Yes, cancel it
      </button>
      <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)}>
        Keep registration
      </button>
    </span>
  );
}
