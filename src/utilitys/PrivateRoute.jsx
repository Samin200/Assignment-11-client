import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import Swal from "sweetalert2";

// allowedRoles = [] means any logged-in user can access
// allowedRoles = ["admin"] means only admins
// allowedRoles = ["librarian", "admin"] means both
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    Swal.fire({
      icon: "warning",
      title: "Login Required",
      text: "You need to log in to access this page.",
      confirmButtonText: "Go to Login",
      timer: 3000,
      timerProgressBar: true,
    }).then(() => {
      window.location.href = "/login";
    });
    return null;
  }

  // Role check — only runs if allowedRoles is specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: `This page is only accessible by: ${allowedRoles.join(" or ")}.`,
      confirmButtonText: "OK",
      timer: 3000,
      timerProgressBar: true,
    }).then(() => {
      window.location.href = "/";
    });
    return null;
  }

  return children;
};

export default PrivateRoute;