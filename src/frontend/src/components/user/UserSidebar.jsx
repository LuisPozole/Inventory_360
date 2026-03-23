import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  Settings,
  X,
  LogOut
} from 'lucide-react';
import './UserSidebar.css';

const menuItems = [
  { key: 'user-dashboard', label: 'Inicio', icon: LayoutDashboard },
  { key: 'user-catalog', label: 'Catálogo', icon: ShoppingBag },
  { key: 'user-profile', label: 'Mi Perfil', icon: User },
  { key: 'user-settings', label: 'Configuración', icon: Settings },
];

const UserSidebar = ({ isOpen, onClose, currentView, onNavigate, onLogout }) => {
  const handleNav = (key) => {
    onNavigate(key);
    onClose();
  };

  return (
    <>
      {/* Overlay — mobile only */}
      <div
        className={`user-sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside className={`user-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="user-sidebar-header">
          <img src="/logo.png" alt="INV 360" className="user-sidebar-logo" />
          <div className="user-sidebar-brand">
            <span className="user-sidebar-brand-name">Inventory 360</span>
            <span className="user-sidebar-brand-role">Vendedor</span>
          </div>
          <button
            className="user-sidebar-close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="user-sidebar-section">Menú</div>
        <nav className="user-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`user-nav-item ${currentView === item.key ? 'active' : ''}`}
                onClick={() => handleNav(item.key)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="user-sidebar-footer">
          <button className="user-nav-item" onClick={onLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;
