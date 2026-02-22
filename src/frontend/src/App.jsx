import React, { useState, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ChatWidget from './components/ChatWidget';
import Sidebar from './components/Sidebar';
import './App.css';

import api from './config/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
    }
  };

  if (!token) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-dark)'
      }}>
        <div className="glass-panel" style={{ width: '350px' }}>
          <h2 style={{ textAlign: 'center' }}>Inventory 360</h2>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="chat-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="chat-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn-primary">Login</button>
            <p style={{ fontSize: '0.8rem', textAlign: 'center', color: '#94a3b8' }}>
              Pro Tip: Usa admin@inventory360.com / 123456
            </p>
          </form>
        </div>
      </div>
    );
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
        <h1 style={{ margin: 0 }}>Inventory 360</h1>
        {lastUpdated && (
          <span className="last-updated" style={{ marginLeft: 'auto' }}>
            Última actualización: {lastUpdated.toLocaleTimeString('es-ES')}
          </span>
        )}
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <Dashboard
        onLastUpdated={setLastUpdated}
        onLogout={() => {
          localStorage.removeItem('token');
          setToken(null);
        }}
      />
      <ChatWidget />
    </div>
  );
}

export default App;
