import { Outlet, Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

/**
 * Wraps protected routes. Redirects to /login when not authenticated.
 */
export default function ProtectedLayout() {
  const { firebaseUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-600">로딩 중...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
