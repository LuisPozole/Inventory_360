import React, { useState } from 'react';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import api from '../config/api';

const ForgotPassword = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.msg);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <img src="/logo.png" alt="INV 360" className="login-logo" />
                <h1 className="login-title">Recuperar Contraseña</h1>
                <p className="login-subtitle">Ingresa tu correo para recibir un enlace de recuperación</p>

                {message && <div style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>{message}</div>}
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

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                    
                    <button type="button" className="login-link-btn" onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                        <FaArrowLeft size={12} /> Volver al inicio de sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
