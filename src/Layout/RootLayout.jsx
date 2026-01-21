import React, { useContext } from "react";
import Navbar from "../Components/Shared/Navbar";
import { Outlet } from "react-router";
import Footer from "../Components/Shared/Footer";
import { AuthContext } from "../Context/AuthContext";
import Loader from "../Context/Loader";

const RootLayout = () => {
  const { loading } = useContext(AuthContext);
  return (
    <div>
      <Navbar></Navbar>
      <div className="min-h-[70vh]">
        {loading ? (
          <div className=" justify-center h-[80vh] flex items-center">
            <div className="text-5xl font-serif italic">Loading</div>
            <Loader></Loader>
          </div>
        ) : (
          <Outlet></Outlet>
        )}
      </div>
      <Footer></Footer>
    </div>
  );
};

export default RootLayout;
