import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ChatWidget from './components/ChatWidget';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  if (!token) {
    return <Login onLoginSuccess={setToken} />;
  }

  return (
    <div>
      <div className="top-bar">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="menu-toggle"
          aria-label="Menu"
        >
          <Menu size={28} strokeWidth={2.5} />
        </button>
        <img src="/logo.png" alt="INV 360" className="topbar-logo" />
        <h1 style={{ margin: 0 }}>Inventory 360</h1>
        {lastUpdated && (
          <span className="last-updated" style={{ marginLeft: 'auto' }}>
            Última actualización: {lastUpdated.toLocaleTimeString('es-ES')}
          </span>
        )}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onNavigate={(view) => { setCurrentView(view); setIsSidebarOpen(false); }}
      />

      {currentView === 'dashboard' && (
        <Dashboard
          onLastUpdated={setLastUpdated}
          onLogout={() => {
            localStorage.removeItem('token');
            setToken(null);
          }}
          onNavigateToProfile={() => setCurrentView('profile')}
        />
      )}

      {currentView === 'inventory' && (
        <Inventory />
      )}

      {currentView === 'profile' && (
        <Profile onBack={() => setCurrentView('dashboard')} />
      )}

      <ChatWidget />
    </div>
  );
}

export default App;
