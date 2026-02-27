import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ChatPage from './components/ChatPage';
import ChatWidget from './components/ChatWidget';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Profile from './components/Profile';
import UserScreen from './components/UserScreen';
import api from './config/api';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUserData(res.data);
        })
        .catch(() => { })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  if (!token) {
    return <Login onLoginSuccess={setToken} />;
  }

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (userData && userData.role === 'Vendedor') {
    return <UserScreen onLogout={() => {
      localStorage.removeItem('token');
      setToken(null);
      setUserData(null);
    }} />;
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

      {currentView === 'chatbot' && (
        <ChatPage userData={userData} />
      )}

      {currentView === 'profile' && (
        <Profile onBack={() => setCurrentView('dashboard')} />
      )}

      {/* Floating widget hidden when ChatPage is active */}
      {currentView !== 'chatbot' && <ChatWidget userData={userData} />}
    </div>
  );
}

export default App;
