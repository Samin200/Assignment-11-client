import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../Context/AuthContext";

const Error = () => {
  const { isDarkMode , setIsDarkMode } = useContext(AuthContext);

   useEffect(() => {
    const savedTheme = localStorage.getItem("isDarkMode");
    if (savedTheme !== null) {
      setIsDarkMode(JSON.parse(savedTheme));
    }
  }, [setIsDarkMode]);

  
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("isDarkMode", JSON.stringify(newTheme));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 text-center p-4">
      <input
        type="checkbox"
            checked={isDarkMode}
            onChange={toggleTheme}
            className="theme-controller hidden"
            value={isDarkMode ? "dark" : "bumblebee"}
      />
      <h1 className="text-9xl font-bold text-error">404</h1>
      <p className="text-2xl mt-4">Oops! Page not found.</p>
      <p className="text-md mt-2 text-gray-600">
        The page you are looking for does not exist.
      </p>
      <a href="/" className="btn btn-primary mt-6">
        Go Home
      </a>
    </div>
  );
};

export default Error;
