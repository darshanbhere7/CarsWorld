import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={`shadow p-4 flex justify-between items-center transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <Link to="/" className={`text-2xl font-bold ${theme === "dark" ? "text-blue-300" : "text-blue-600"}`}>
        CarsWorld
      </Link>

      <div className="space-x-4 flex items-center">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-300">Home</Link>
        <Link to="/cars" className="hover:text-blue-600 dark:hover:text-blue-300">Cars</Link>
        <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-300">Contact Us</Link>

        {user ? (
          <>
            {user.role === "admin" && (
              <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-300">Admin</Link>
            )}
            <Link to="/wishlist" className="hover:text-blue-600 dark:hover:text-blue-300">Wishlist</Link>
            <Link to="/profile" className="hover:text-blue-600 dark:hover:text-blue-300">Profile</Link>
            <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-300">Dashboard</Link>
            <button onClick={handleLogout} className="text-red-600 font-medium ml-2">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-300">Login</Link>
            <Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-300">Register</Link>
          </>
        )}
        <button
          onClick={toggleTheme}
          className="ml-4 px-3 py-1 rounded border border-blue-600 dark:border-blue-300 text-blue-600 dark:text-blue-300 bg-transparent hover:bg-blue-50 dark:hover:bg-gray-800 transition"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
