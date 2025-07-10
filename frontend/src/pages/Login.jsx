import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import gsap from "gsap";
import navbarLogo from "../assets/navbarlogo.png";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // Animation refs
  const cardRef = useRef(null);
  const headerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current, { opacity: 0, y: 40, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" });
    gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: "power3.out" });
    gsap.fromTo(buttonRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.7, delay: 0.4, ease: "power2.out" });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email) return "Email is required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Invalid email format.";
    if (!form.password) return "Password is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 animate-gradient-move">
      <div
        ref={cardRef}
        className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-gray-900/80 backdrop-blur-lg animate-fade-in relative overflow-hidden border border-blue-800/40 group"
      >
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-4">
          <img src={navbarLogo} alt="CarsWorld Logo" className="w-16 h-16 object-contain drop-shadow-2xl animate-bounce-slow mb-0.5" />
          <span className="text-2xl font-playfair font-extrabold tracking-wider animate-gradient-text text-center antialiased logo">CarsWorld</span>
          <span className="text-blue-200 text-sm font-inter mt-1">Drive Your Dreams</span>
        </div>
        {/* Glowing border effect */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500 group-focus-within:border-purple-500 transition-all duration-300 group-hover:shadow-[0_0_32px_4px_rgba(80,63,205,0.25)]" />
        <h2 ref={headerRef} className="text-3xl font-bold font-playfair tracking-wide text-white text-center mb-6 antialiased animate-gradient-text">Sign in to your account</h2>
        {error && <p className="text-red-400 mb-4 text-center font-semibold animate-pulse">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white placeholder:text-blue-300 border border-blue-800/60 shadow-md rounded-lg"
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
              className="mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-gray-900/60 text-white placeholder:text-blue-300 border border-blue-800/60 shadow-md rounded-lg"
            />
          </div>
          <Button
            ref={buttonRef}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 focus:ring-4 focus:ring-blue-400/40 text-white font-semibold py-2 rounded-xl transition-all duration-300 hover:scale-105 focus:scale-102 active:scale-98 shadow-lg relative overflow-hidden group"
            style={{ boxShadow: '0 4px 24px 0 rgba(80, 63, 205, 0.25)' }}
          >
            <span className="relative z-10">Login</span>
            {/* Glowing effect */}
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30 blur-[2px]" />
          </Button>
        </form>
        <p className="mt-6 text-sm text-blue-200 text-center">
          Don't have an account?{' '}
          <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto" asChild>
            <a href="/register">Register</a>
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
          background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #06b6d4, #8b5cf6, #3b82f6);
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

export default Login;
