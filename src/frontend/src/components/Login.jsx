import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import api from '../config/api';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                onLoginSuccess(res.data.token);
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <img src="/logo.png" alt="INV 360" className="login-logo" />
                <h1 className="login-title">Inventory 360</h1>
                <p className="login-subtitle">Inicia sesión para continuar</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="login-tip">
                    💡 Usa <strong>admin@inventory360.com</strong> / <strong>123456</strong>
                </p>
            </div>
        </div>
    );
};

export default Login;
