import { useContext } from "react";
import { Link, NavLink } from "react-router";
import { AuthContext } from "../../Context/AuthContext";
import Swal from "sweetalert2";

export default function Navbar() {
  const { isDarkMode, setIsDarkMode, user, logout } = useContext(AuthContext);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("isDarkMode", JSON.stringify(newTheme));
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        Swal.fire({ icon: "success", title: "Logged out", timer: 1500, showConfirmButton: false });
      }
    });
  };

  const navLinkClass = ({ isActive }) =>
    [
      "relative px-1 py-0.5 font-medium text-sm transition-colors duration-200",
      "after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-primary",
      "after:transition-all after:duration-300",
      isActive
        ? "text-primary after:w-full"
        : "text-base-content/70 hover:text-primary after:w-0 hover:after:w-full",
    ].join(" ");

  const dropLinkClass = ({ isActive }) =>
    isActive
      ? "bg-primary/10 text-primary font-semibold rounded-lg"
      : "hover:bg-base-200 rounded-lg transition-colors duration-150";

  // ── Navbar links — NO "Add Book" or "My Books" here ─────────────────────────
  const navbarLinks = (
    <>
      <li><NavLink to="/"      className={navLinkClass}>Home</NavLink></li>
      <li><NavLink to="/books" className={navLinkClass}>All Books</NavLink></li>

      {user?.role === "librarian" && (
        <li><NavLink to="/librarian-dashboard" className={navLinkClass}>My Dashboard</NavLink></li>
      )}

      {user?.role === "admin" && (
        <>
          <li><NavLink to="/librarian-dashboard" className={navLinkClass}>Librarian View</NavLink></li>
          <li><NavLink to="/admin-dashboard"     className={navLinkClass}>Admin</NavLink></li>
        </>
      )}

      {(!user || user?.role === "user") && (
        <li><NavLink to="/become-librarian" className={navLinkClass}>Become a Librarian</NavLink></li>
      )}
    </>
  );

  // ── Dropdown — Add Book stays here for librarian/admin ──────────────────────
  const dropdownLinks = (
    <>
      <li><NavLink to="/profile"   className={dropLinkClass}>👤 Profile</NavLink></li>
      <li><NavLink to="/my-orders" className={dropLinkClass}>📦 My Orders</NavLink></li>
      <li><NavLink to="/my-wishlist" className={dropLinkClass}>❤️ My Wishlist</NavLink></li>
      <li><NavLink to="/invoices"  className={dropLinkClass}>🧾 Invoices</NavLink></li>

      {user?.role === "user" && (
        <li><NavLink to="/become-librarian" className={dropLinkClass}>🎓 Become a Librarian</NavLink></li>
      )}

      {/* ✅ Add Book and dashboard only in dropdown for librarian/admin — NOT in navbar */}
      {user?.role === "librarian" && (
        <>
          <li className="px-3 pt-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/40">Librarian</span>
          </li>
          <li><NavLink to="/add-book"            className={dropLinkClass}>➕ Add Book</NavLink></li>
          <li><NavLink to="/librarian-dashboard" className={dropLinkClass}>🗂 My Dashboard</NavLink></li>
        </>
      )}

      {user?.role === "admin" && (
        <>
          <li className="px-3 pt-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/40">Admin</span>
          </li>
          <li><NavLink to="/add-book"            className={dropLinkClass}>➕ Add Book</NavLink></li>
          <li><NavLink to="/librarian-dashboard" className={dropLinkClass}>🗂 Librarian View</NavLink></li>
          <li><NavLink to="/admin-dashboard"     className={dropLinkClass}>⚙️ Admin Dashboard</NavLink></li>
        </>
      )}

      <li className="mt-2 pt-2 border-t border-base-200">
        <button
          onClick={handleLogout}
          className="w-full text-left text-error font-medium px-3 py-2 rounded-lg hover:bg-error/10 transition-colors duration-150"
        >
          🚪 Logout
        </button>
      </li>
    </>
  );

  return (
    <div className="navbar bg-base-100 border-b-2 border-primary px-2 sm:px-4 sticky top-0 z-50 shadow-sm">

      {/* ── navbar-start: hamburger + brand ── */}
      <div className="navbar-start">
        {/* Hamburger — mobile only */}
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex="-1" className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow border border-base-200">
            {navbarLinks}
          </ul>
        </div>

        <Link to="/" className="btn btn-ghost text-lg sm:text-xl font-extrabold text-primary tracking-tight">
          BookCourier
        </Link>
      </div>

      {/* ── navbar-center: desktop links only ── */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1 px-1">
          {navbarLinks}
        </ul>
      </div>

      {/* ── navbar-end: theme + avatar/login (ALL screen sizes) ── */}
      <div className="navbar-end gap-4 sm:gap-6">

        {/* ✅ Theme toggle — always visible */}
        <label className="toggle text-base-content">
          <input type="checkbox" checked={isDarkMode} onChange={toggleTheme}
            className="theme-controller" value={isDarkMode ? "dark" : "bumblebee"} />
          <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5">
            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2"/><path d="M12 20v2"/>
              <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
              <path d="M2 12h2"/><path d="M20 12h2"/>
              <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
            </g>
          </svg>
          <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5">
            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </g>
          </svg>
        </label>

        {/* ✅ Avatar OR Login+Signup — always visible */}
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button"
              className="btn btn-ghost btn-circle avatar ring-2 ring-primary ring-offset-2 ring-offset-base-100 hover:ring-offset-0 transition-all duration-200">
              <div className="w-8 sm:w-10 rounded-full">
                <img alt="avatar" src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "U")}&background=random&size=40`} />
              </div>
            </div>
            <ul tabIndex="-1" className="menu menu-sm dropdown-content bg-base-100 rounded-2xl z-50 mt-3 w-56 p-2 border border-base-200 shadow-xl">
              <li className="px-3 py-3 border-b border-base-200 mb-2 pointer-events-none">
                <div>
                  <p className="font-bold text-sm truncate">{user.displayName || "User"}</p>
                  <p className="text-xs text-base-content/50 truncate">{user.email}</p>
                  <span className="badge badge-xs badge-primary capitalize mt-1.5">{user.role}</span>
                </div>
              </li>
              {dropdownLinks}
            </ul>
          </div>
        ) : (
          /* ✅ Login + Sign Up — always visible, compact on mobile */
          <div className="flex gap-1 sm:gap-2">
            <Link to="/login"  className="btn btn-ghost btn-xs sm:btn-sm rounded-full px-2 sm:px-4">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-xs sm:btn-sm rounded-full px-2 sm:px-5">Sign Up</Link>
          </div>
        )}
      </div>
    </div>
  );
}