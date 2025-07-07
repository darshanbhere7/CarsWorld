import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cars from "./pages/Cars";
import CarDetail from "./pages/CarDetail";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import Wishlist from "./pages/Wishlist";
import ContactUs from "./pages/ContactUs";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-blue-100 transition-colors duration-300">
      <Navbar />

      {/* Global Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>

      <Footer />
      {/* 🔔 Toast Notifications */}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default App;
