import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="admin-splash-shell">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function RequireRole({ role, children }) {
  const { hasRole } = useAuth();

  if (!hasRole(role)) {
    return (
      <div className="admin-access-denied">
        <h1>Access denied</h1>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
