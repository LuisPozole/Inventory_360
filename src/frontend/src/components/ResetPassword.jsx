import React, { useState } from 'react';
import { FaLock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import api from '../config/api';

const ResetPassword = ({ token, onBack }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        if (password.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres');
        }

        setLoading(true);
        setError('');
        
        try {
            await api.post('/auth/reset-password', { token, password });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al restablecer la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-container">
                <div className="login-card" style={{ textAlign: 'center' }}>
                    <FaCheckCircle size={60} color="#4ade80" style={{ marginBottom: '20px' }} />
                    <h1 className="login-title">¡Éxito!</h1>
                    <p className="login-subtitle">Tu contraseña ha sido actualizada correctamente.</p>
                    <button 
                        className="login-button" 
                        onClick={() => {
                            // Clear URL token and go back
                            window.history.replaceState({}, document.title, window.location.pathname);
                            onBack();
                        }}
                    >
                        Ir al Inicio de Sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <img src="/logo.png" alt="INV 360" className="login-logo" />
                <h1 className="login-title">Nueva Contraseña</h1>
                <p className="login-subtitle">Ingresa tu nueva contraseña para acceder a tu cuenta</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Nueva contraseña"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Confirmar contraseña"
                            className="login-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Guardando...' : 'Restablecer Contraseña'}
                    </button>
                    
                    <button type="button" className="login-link-btn" onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                        <FaArrowLeft size={12} /> Cancelar y volver
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
