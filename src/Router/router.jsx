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
import AdminDashboard from "../Pages/Admin/AdminDashBoard";
import PrivateRoute from "../utilitys/PrivateRoute";
import BecomeLibrarian from "../Pages/BecomeLibrarian/BecomeLibrarian";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "books",
        element: <AllBooks />,
      },
      {
        path: "book/:id",
        element: <BookDetails />,
      },

      // ===== USER PROTECTED ROUTES =====
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <MyProfile />
          </PrivateRoute>
        ),
      },
      {
        path: "my-orders",
        element: (
          <PrivateRoute>
            <MyOrders />
          </PrivateRoute>
        ),
      },
      {
        path: "invoices",
        element: (
          <PrivateRoute>
            <Invoices />
          </PrivateRoute>
        ),
      },

      {
        path: "become-librarian",
        element: (
          <PrivateRoute>
            <BecomeLibrarian />
          </PrivateRoute>
        ),
      },

      // ===== ADMIN PROTECTED ROUTE =====
      {
        path: "admin-dashboard",
        element: (
          <PrivateRoute requiredRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
