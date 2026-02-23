import React from 'react';
import { LayoutDashboard, Box, MessageSquare, Settings } from 'lucide-react';
import './Sidebar.css';

const viewMap = {
  'Dashboard': 'dashboard',
  'Inventario': 'inventory',
  'ChatBot': 'chatbot',
  'Configuración': 'settings',
};

const Sidebar = ({ isOpen, onClose, currentView, onNavigate }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard /> },
    { name: 'Inventario', icon: <Box /> },
    { name: 'ChatBot', icon: <MessageSquare /> },
    { name: 'Configuración', icon: <Settings /> },
  ];

  const handleClick = (itemName) => {
    const view = viewMap[itemName];
    if (view && onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="INV 360" className="sidebar-logo" />
          <span className="sidebar-title">INV 360</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${currentView === viewMap[item.name] ? 'active' : ''}`}
              onClick={() => handleClick(item.name)}
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
