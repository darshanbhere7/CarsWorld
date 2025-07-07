import React from "react";

const Footer = () => (
  <footer className="w-full bg-gray-900 text-white py-6 mt-8 flex flex-col items-center dark:bg-gray-950 dark:text-blue-100">
    <div className="mb-2 font-semibold text-lg">Darshan Bhere</div>
    <div className="mb-2">Contact: <a href="tel:+919999999999" className="underline hover:text-blue-400">8080583088</a></div>
    <div className="flex gap-4">
      <a href="https://www.linkedin.com/in/darshan-bhere-b69a14260/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">LinkedIn</a>
      <a href="https://github.com/darshanbhere7" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">GitHub</a>
    </div>
  </footer>
);

export default Footer; 