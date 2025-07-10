import React from "react";
import { Github, Linkedin, Phone, Mail } from "lucide-react";
import navbarLogo from "../assets/navbarlogo.png";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-br from-blue-950 via-purple-950 to-gray-900 text-white border-t border-blue-900/60 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {/* Brand & Logo */}
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <div className="flex items-center gap-2 mb-1">
              <img src={navbarLogo} alt="CarsWorld Logo" className="w-14 h-14 object-contain drop-shadow-lg" />
              <span className="text-2xl font-extrabold font-playfair tracking-wider text-white drop-shadow-lg antialiased logo animate-gradient-text">CarsWorld</span>
            </div>
            <p className="text-blue-200 text-sm font-inter max-w-xs text-center md:text-left leading-snug">Your premium destination for luxury and sports car rentals. Experience the drive of your dreams.</p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-0.5 items-center md:items-start">
            <h4 className="font-playfair text-lg font-bold tracking-wide mb-1 antialiased">Quick Links</h4>
            <a href="/" className="text-blue-200 hover:text-blue-400 transition-colors font-inter text-sm">Home</a>
            <a href="/cars" className="text-blue-200 hover:text-blue-400 transition-colors font-inter text-sm">Cars</a>
            <a href="/contact" className="text-blue-200 hover:text-blue-400 transition-colors font-inter text-sm">Contact Us</a>
            <a href="/dashboard" className="text-blue-200 hover:text-blue-400 transition-colors font-inter text-sm">Dashboard</a>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-0.5 items-center md:items-start">
            <h4 className="font-playfair text-lg font-bold tracking-wide mb-1 antialiased">Contact</h4>
            <a 
              href="tel:+918080583088" 
              className="flex items-center gap-2 text-blue-200 hover:text-blue-400 transition-colors font-inter text-sm"
            >
              <Phone className="w-5 h-5" />
              +91 8080583088
            </a>
            <a 
              href="mailto:darshanbhere2@gmail.com" 
              className="flex items-center gap-2 text-blue-200 hover:text-blue-400 transition-colors font-inter text-sm"
            >
              <Mail className="w-5 h-5" />
              darshanbhere2@gmail.com
            </a>
          </div>

          {/* Social & Owner - Redesigned */}
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <h4 className="font-playfair text-lg font-bold tracking-wide mb-1 antialiased">Connect</h4>
            <span className="text-sm text-blue-300 font-inter">Follow me</span>
            <div className="flex gap-3 mb-1">
              <Button asChild variant="ghost" size="icon" className="bg-blue-900/40 hover:bg-blue-800/70 group transition-all rounded-full shadow-md w-10 h-10 p-0">
                <a href="https://www.linkedin.com/in/darshan-bhere-b69a14260/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="w-6 h-6 text-blue-200 group-hover:text-blue-400 transition-transform group-hover:scale-110" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="bg-blue-900/40 hover:bg-blue-800/70 group transition-all rounded-full shadow-md w-10 h-10 p-0">
                <a href="https://github.com/darshanbhere7" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="w-6 h-6 text-blue-200 group-hover:text-blue-400 transition-transform group-hover:scale-110" />
                </a>
              </Button>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <span className="font-playfair text-base font-bold tracking-wide text-white antialiased">Darshan Bhere</span>
              <p className="text-sm text-blue-300 font-inter">Founder & Developer</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-3 border-t border-blue-900/60" />

        {/* Copyright */}
        <div className="mt-1 text-center text-sm text-blue-300 font-inter">
          <p>© 2025 CarsWorld. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;