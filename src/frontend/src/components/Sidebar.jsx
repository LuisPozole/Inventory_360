import React, { useState } from 'react';
import { LayoutDashboard, Box, MessageSquare, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard /> },
    { name: 'Inventario', icon: <Box /> },
    { name: 'ChatBot', icon: <MessageSquare /> },
    { name: 'Configuración', icon: <Settings /> },
  ];

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
           {/* Placeholder for logo or title if needed */}
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
