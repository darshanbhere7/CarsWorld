import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Remove: import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  LogOut, 
  Heart, 
  LayoutDashboard, 
  Shield,
  Moon,
  Sun,
  Menu,
  X,
  Car,
  Home,
  Mail,
  Bell,
  Search,
  ChevronDown
} from "lucide-react";
import navbarLogo from "../assets/navbarlogo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Remove: const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavLink = ({ to, children, icon: Icon, onClick }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`
          relative group flex items-center space-x-2 px-4 py-2 rounded-lg
          font-medium tracking-wide transition-all duration-300
          ${isActive 
            ? "text-white bg-gradient-to-r from-blue-700/60 to-purple-700/60 shadow-lg scale-105"
            : "text-blue-200 hover:text-white hover:bg-blue-800/30"
          }
          hover:scale-110 hover:-translate-y-1 hover:shadow-xl
          after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-blue-400 after:to-purple-400 after:rounded-full
          after:transition-all after:duration-500 after:ease-out
          ${isActive ? 'after:w-3/4 after:opacity-100' : 'group-hover:after:w-1/2 group-hover:after:opacity-80'}
        `}
      >
        {Icon && (
          <Icon 
            size={18} 
            className={`
              transition-all duration-500 ease-out
              ${isActive ? 'text-blue-300 scale-110' : 'group-hover:text-blue-400'}
              group-hover:rotate-6 group-hover:scale-110
            `} 
          />
        )}
        <span>{children}</span>
      </Link>
    );
  };



  return (
    <>
      {/* Custom CSS styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .animate-gradient-text {
            background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #06b6d4, #8b5cf6, #3b82f6);
            background-size: 400% 400%;
            animation: gradient-shift 4s ease infinite;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          @keyframes float-gentle {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-2px) rotate(2deg); }
          }
          
          .animate-float-gentle {
            animation: float-gentle 3s ease-in-out infinite;
          }
          
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          
          .animate-pulse-ring {
            position: relative;
          }
          
          .animate-pulse-ring::before {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: linear-gradient(45deg, #3b82f6, #8b5cf6);
            animation: pulse-ring 2s ease-out infinite;
            z-index: -1;
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          .animate-shimmer {
            position: relative;
            overflow: hidden;
          }
          
          .animate-shimmer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.1),
              transparent
            );
            animation: shimmer 2s ease-in-out infinite;
          }
          
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          
          .animate-bounce-subtle {
            animation: bounce-subtle 2s ease-in-out infinite;
          }
          
          .glass-morphism {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .glass-morphism-dark {
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `
      }} />

      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out
        bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 shadow-xl border-b border-blue-900/60
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="group flex items-center space-x-1 transform transition-all duration-500 hover:scale-105"
            >
              <img 
                src={navbarLogo} 
                alt="CarsWorld Logo" 
                className="w-12 h-12 object-contain drop-shadow-lg" 
                style={{ minWidth: 48 }}
              />
              <span className="text-2xl font-extrabold font-playfair tracking-wider text-white drop-shadow-lg antialiased logo">
                CarsWorld
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              <NavLink to="/" icon={Home}>Home</NavLink>
              <NavLink to="/cars" icon={Car}>Cars</NavLink>
              <NavLink to="/contact" icon={Mail}>Contact Us</NavLink>
            </div>

            {/* Center Space - Hidden on mobile */}
            <div className="hidden md:flex items-center">
              {/* Reserved for future features */}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3">

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-12 w-12 rounded-full group animate-pulse-ring">
                      <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all duration-500 group-hover:scale-110">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {user.name?.charAt(0) || user.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {user.role === "admin" && (
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center animate-bounce-subtle bg-gradient-to-r from-yellow-400 to-orange-500"
                        >
                          <Shield size={12} className="text-white" />
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className={`
                      w-64 animate-in slide-in-from-top-2 duration-300 
                      bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900/95 text-white
                      backdrop-blur-xl shadow-2xl rounded-xl
                    `}
                  >
                    <div className="px-4 py-3">
                      <p className="text-base font-semibold text-white">{user.name || user.email}</p>
                      <p className="text-xs text-blue-200">{user.email}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs text-blue-200 border-blue-400 bg-blue-900/40">
                          {user.role}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer group text-white hover:text-blue-200">
                        <User size={16} className="mr-3 group-hover:text-blue-500 transition-colors" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer group text-white hover:text-blue-200">
                        <LayoutDashboard size={16} className="mr-3 group-hover:text-blue-500 transition-colors" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className="cursor-pointer group text-white hover:text-blue-200">
                        <Heart size={16} className="mr-3 group-hover:text-red-500 transition-colors" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer group text-white hover:text-blue-200">
                          <Shield size={16} className="mr-3 group-hover:text-yellow-500 transition-colors" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-600 cursor-pointer group hover:bg-red-50"
                    >
                      <LogOut size={16} className="mr-3 group-hover:scale-110 transition-transform" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    asChild
                    className="relative overflow-hidden group hover:scale-105 transition-all duration-300"
                  >
                    <Link to="/login" className="font-medium">
                      Login
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </Button>
                  <Button 
                    asChild
                    className="relative overflow-hidden group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-shimmer"
                  >
                    <Link to="/register" className="font-medium">
                      Register
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="md:hidden h-10 w-10 rounded-full hover:scale-110 transition-all duration-300"
              >
                <div className="relative">
                  {isMobileMenuOpen ? (
                    <X size={20} className="transition-all duration-300 rotate-90" />
                  ) : (
                    <Menu size={20} className="transition-all duration-300" />
                  )}
                </div>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`
            md:hidden overflow-hidden transition-all duration-500 ease-out
            ${isMobileMenuOpen 
              ? "max-h-screen opacity-100 pb-6" 
              : "max-h-0 opacity-0"
            }
          `}>
            <div className="px-2 pt-4 pb-3 space-y-2">
              
              {/* Mobile Navigation Links */}
              <NavLink to="/" icon={Home} onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/cars" icon={Car} onClick={() => setIsMobileMenuOpen(false)}>
                Cars
              </NavLink>
              <NavLink to="/contact" icon={Mail} onClick={() => setIsMobileMenuOpen(false)}>
                Contact Us
              </NavLink>
              
              {user ? (
                <>
                  <div className="border-t border-gray-200 my-4 pt-4">
                    <div className="flex items-center space-x-3 px-3 py-2 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                          {user.name?.charAt(0) || user.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    
                    <NavLink to="/profile" icon={User} onClick={() => setIsMobileMenuOpen(false)}>
                      Profile
                    </NavLink>
                    <NavLink to="/dashboard" icon={LayoutDashboard} onClick={() => setIsMobileMenuOpen(false)}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/wishlist" icon={Heart} onClick={() => setIsMobileMenuOpen(false)}>
                      Wishlist
                    </NavLink>
                    {user.role === "admin" && (
                      <NavLink to="/admin" icon={Shield} onClick={() => setIsMobileMenuOpen(false)}>
                        Admin Panel
                      </NavLink>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 flex items-center space-x-3 group"
                    >
                      <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 my-4 pt-4 space-y-3">
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="w-full justify-start h-12 rounded-xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/login" className="font-medium">Login</Link>
                  </Button>
                  <Button 
                    asChild 
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/register" className="font-medium">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;