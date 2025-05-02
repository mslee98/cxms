// src/components/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isVisible: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible }) => {
  return (
    <div
      className={`transition-all ${isVisible ? 'w-64 opacity-100' : 'w-0 opacity-0'} bg-gradient-to-b from-[#1e5eb1] to-[#a8e1e1] text-white`}
    >
      <ul className="space-y-4 p-4">
        <li>
          <Link
            to="/client"
            className="bg-[#25a8f5] text-gray-200 hover:text-white p-3 block rounded-lg text-lg font-semibold transition-all cursor-pointer"
          >
            고객사 관리
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
