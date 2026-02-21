import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ profile, children }) {
  if (!profile) {
    return <Navigate to="/profile" replace />;
  }
  return children;
}
