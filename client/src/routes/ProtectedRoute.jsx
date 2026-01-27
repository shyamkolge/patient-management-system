import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Spinner } from '../components/common/Spinner.jsx';

const ProtectedRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
