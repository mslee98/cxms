// src/components/Header.tsx
import React from 'react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="p-4 text-white flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-black">CXMS</h1>
        <button
          onClick={toggleSidebar}
          className="flex flex-col justify-center items-center w-12 h-12 rounded-full bg-[#007bff] p-2"
        >
          <div className="w-7 h-0.5 bg-white mb-1 rounded-full"></div>
          <div className="w-7 h-0.5 bg-white mb-1 rounded-full"></div>
          <div className="w-7 h-0.5 bg-white rounded-full"></div>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/" className="hover:text-gray-300">Home</a></li>
            <li><a href="/about" className="hover:text-gray-300">About</a></li>
            <li><a href="/contact" className="hover:text-gray-300">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
