import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import gsap from "gsap";
import navbarLogo from "../assets/navbarlogo.png";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Animation refs
  const cardRef = useRef(null);
  const headerRef = useRef(null);
  const buttonRef = useRef(null);

  // Helper to detect mobile
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (!isMobile) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 40, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: "power3.out" });
      gsap.fromTo(buttonRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.7, delay: 0.4, ease: "power2.out" });
    }
  }, [isMobile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name) return "Name is required.";
    if (!form.email) return "Email is required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Invalid email format.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const res = await api.post("/auth/register", form);
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 animate-gradient-move p-2 sm:p-4">
      <div
        ref={cardRef}
        className="w-full max-w-xs sm:max-w-md p-4 sm:p-8 rounded-2xl shadow-2xl bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 backdrop-blur-lg animate-fade-in relative overflow-hidden border border-blue-800/40 group"
      >
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-4">
          <img src={navbarLogo} alt="CarsWorld Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-2xl animate-bounce-slow mb-0.5" />
          <span className="text-xl sm:text-2xl font-playfair font-extrabold tracking-wider animate-gradient-text text-center antialiased logo">CarsWorld</span>
          <span className="text-blue-200 text-xs sm:text-sm font-inter mt-1">Drive Your Dreams</span>
        </div>
        {/* Glowing border effect */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-green-500 group-focus-within:border-purple-500 transition-all duration-300 group-hover:shadow-[0_0_32px_4px_rgba(16,185,129,0.25)]" />
        <h2 ref={headerRef} className="text-2xl sm:text-3xl font-bold font-playfair tracking-wide text-white text-center mb-6 antialiased animate-gradient-text">Create your account</h2>
        {message && <p className="text-green-400 mb-4 text-center font-semibold animate-pulse">{message}</p>}
        {error && <p className="text-red-400 mb-4 text-center font-semibold animate-pulse">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <Label htmlFor="name" className="text-blue-200">Full Name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              aria-label="Full name"
              className="mt-1 focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all duration-200 bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white placeholder:text-blue-300 border border-blue-800/60 shadow-md rounded-lg text-base sm:text-lg py-2 sm:py-2.5"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-blue-200">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              aria-label="Email address"
              className="mt-1 focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all duration-200 bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white placeholder:text-blue-300 border border-blue-800/60 shadow-md rounded-lg text-base sm:text-lg py-2 sm:py-2.5"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-blue-200">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              aria-label="Password"
              className="mt-1 focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all duration-200 bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white placeholder:text-blue-300 border border-blue-800/60 shadow-md rounded-lg text-base sm:text-lg py-2 sm:py-2.5"
            />
          </div>
          <Button
            ref={buttonRef}
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-purple-600 hover:from-purple-600 hover:to-green-600 focus:ring-4 focus:ring-green-400/40 text-white font-semibold py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-105 focus:scale-102 active:scale-98 shadow-lg relative overflow-hidden group text-base sm:text-lg"
            style={{ boxShadow: '0 4px 24px 0 rgba(16,185,129,0.25)' }}
            aria-label="Register"
          >
            <span className="relative z-10">Register</span>
            {/* Glowing effect */}
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300 bg-gradient-to-r from-green-400/30 via-purple-400/30 to-green-400/30 blur-[2px]" />
          </Button>
        </form>
        <p className="mt-6 text-xs sm:text-sm text-blue-200 text-center">
          Already have an account?{' '}
          <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto text-xs sm:text-sm" asChild>
            <a href="/login" tabIndex={0} aria-label="Go to login page">Login</a>
          </Button>
        </p>
      </div>
      <style>{`
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-move {
          background-size: 400% 400%;
          animation: gradient-move 12s ease infinite;
        }
        .animate-gradient-text {
          background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #10b981, #8b5cf6, #3b82f6);
          background-size: 400% 400%;
          animation: gradient-move 6s ease infinite;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default Register;
