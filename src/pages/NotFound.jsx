import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState title="Page not found">
        <p>The page you are looking for does not exist or has moved.</p>
        <Link to="/events" className="btn btn--primary">Browse events</Link>
      </EmptyState>
    </div>
  );
}
