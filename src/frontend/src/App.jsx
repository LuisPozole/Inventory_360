import React, { useState, useEffect } from 'react';
import { MoreVertical, LogOut } from 'lucide-react';
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
      <div className="top-bar" style={{ justifyContent: 'flex-start', gap: '20px' }}>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="menu-toggle"
          aria-label="Menu"
        >
          <MoreVertical size={24} />
        </button>
        <h1 style={{ margin: 0 }}>Inventory 360</h1>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Temporary Logout button since it was in the header before, 
          maybe user wants it in Sidebar now? Keeping it for safety but moving it or just relying on settings.
          Actually, I'll keep the logout logic somewhere accessible. 
          For now, I'll leave the logout button visible or maybe put it in the sidebar later.
          The requirement was specific about the sidebar. 
          The original code had a Logout button in the header. 
          I replaced the header with 'top-bar' and the menu button. 
          I should probably include the logout button or move it to the sidebar. 
          The user only asked for the sidebar menu. 
          I'll add the logout button NEXT to the menu button for now so functionality isn't lost.
      */}
      <button
        onClick={() => {
          localStorage.removeItem('token');
          setToken(null);
        }}
        style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          padding: '8px 16px',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 50
        }}
      >
        Logout
      </button>


      <Dashboard />
      <ChatWidget />
    </div>
  );
}

export default App;
