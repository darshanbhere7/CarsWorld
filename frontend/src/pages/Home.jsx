import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-4xl md:text-6xl font-bold text-blue-700 mb-4">Welcome to CarsWorld 🚗</h1>
      <p className="text-gray-600 mb-6 text-lg">
        Rent your favorite car today with our seamless booking experience.
      </p>

      <div className="flex gap-4">
        <Link
          to="/cars"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse Cars
        </Link>
        <Link
          to="/login"
          className="px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;
