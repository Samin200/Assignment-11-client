import { Navigate, useLocation } from "react-router";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";

const PrivateRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // wait until auth state is resolved (important for reload)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // role protected
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;