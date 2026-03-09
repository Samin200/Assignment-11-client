import { createBrowserRouter } from "react-router";
import RootLayout from "../Layout/RootLayout";
import Home from "../Pages/Home/Home";
import Error from "../Pages/ErrorPage/Error";
import Login from "../Pages/Login/Login";
import SignUp from "../Pages/SignUp/SignUp";
import AllBooks from "../Pages/AllBooks/AllBooks";
import BookDetails from "../Components/Shared/BookDetails";
import MyProfile from "../Components/UserPages/MyProfile";
import MyOrders from "../Components/UserPages/MyOrders";
import Invoices from "../Components/UserPages/Invoices";
import AdminDashboard from "../Pages/Admin/AdminDashboard";  // ✅ lowercase d
import PrivateRoute from "../utilitys/PrivateRoute";
import BecomeLibrarian from "../Pages/BecomeLibrarian/BecomeLibrarian";
import MyWishlist from "../Components/UserPages/MyWishlist";
import AddBook from "../Pages/BecomeLibrarian/AddBook";
import MyBooks from "../Pages/BecomeLibrarian/MyBook";
import LibrarianDashboard from "../Pages/BecomeLibrarian/LibrarianDashboard";
import EditBook from "../Pages/BecomeLibrarian/EditBook"; // ✅ NEW

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home /> },
      { path: "login",    element: <Login /> },
      { path: "signup",   element: <SignUp /> },
      { path: "books",    element: <AllBooks /> },
      { path: "book/:id", element: <BookDetails /> },

      // ── Any logged-in user ──────────────────────────────────
      {
        path: "profile",
        element: <PrivateRoute><MyProfile /></PrivateRoute>,
      },
      {
        path: "my-orders",
        element: <PrivateRoute><MyOrders /></PrivateRoute>,
      },
      {
        path: "invoices",
        element: <PrivateRoute><Invoices /></PrivateRoute>,
      },
      {
        path: "my-books",
        element: <PrivateRoute><MyBooks /></PrivateRoute>,
      },
      {
        path: "my-wishlist",
        element: <PrivateRoute><MyWishlist /></PrivateRoute>,
      },
      {
        path: "become-librarian",
        element: <PrivateRoute><BecomeLibrarian /></PrivateRoute>,
      },

      // ── Librarian OR Admin ──────────────────────────────────
      {
        path: "add-book",
        element: (
          <PrivateRoute allowedRoles={["librarian", "admin"]}>
            <AddBook />
          </PrivateRoute>
        ),
      },
      {
        path: "librarian-dashboard",
        element: (
          <PrivateRoute allowedRoles={["librarian", "admin"]}>
            <LibrarianDashboard />
          </PrivateRoute>
        ),
      },
      {
        // ✅ NEW — edit a specific book by ID
        path: "edit-book/:id",
        element: (
          <PrivateRoute allowedRoles={["librarian", "admin"]}>
            <EditBook />
          </PrivateRoute>
        ),
      },

      // ── Admin only ──────────────────────────────────────────
      {
        path: "admin-dashboard",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        ),
      },
    ],
  },
]);