import React, { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Palette, Bell, Bot, Shield, Users, Save, Download, LogOut } from 'lucide-react';
import api from '../config/api';
import './Settings.css';

const Settings = ({ onBack, userData }) => {
    const [activeTab, setActiveTab] = useState('appearance');
    const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'dark');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    // Form States
    const [currency, setCurrency] = useState('MXN');
    const [alertsEnabled, setAlertsEnabled] = useState(true);
    const [criticalThreshold, setCriticalThreshold] = useState(15);
    const [aiTone, setAiTone] = useState('Profesional');
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Vendedor' });

    // Load Local Preferences
    useEffect(() => {
        const lp = JSON.parse(localStorage.getItem('userPrefs') || '{}');
        if (lp.currency) setCurrency(lp.currency);
        if (lp.alertsEnabled !== undefined) setAlertsEnabled(lp.alertsEnabled);
        if (lp.criticalThreshold) setCriticalThreshold(lp.criticalThreshold);
        if (lp.aiTone) setAiTone(lp.aiTone);
    }, []);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const savePreferences = () => {
        const lp = { currency, alertsEnabled, criticalThreshold, aiTone };
        localStorage.setItem('userPrefs', JSON.stringify(lp));
        showMessage('Preferencias guardadas exitosamente');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return showMessage('Las contraseñas no coinciden', 'error');
        }
        if (passwords.new.length < 6) {
            return showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        }

        setLoading(true);
        try {
            await api.put('/profile/password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            showMessage('Contraseña actualizada correctamente');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            showMessage(err.response?.data?.msg || 'Error al cambiar la contraseña', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/create-user', newUser);
            showMessage('Usuario creado exitosamente');
            setNewUser({ name: '', email: '', password: '', role: 'Vendedor' });
        } catch (err) {
            showMessage(err.response?.data?.msg || 'Error al crear usuario', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = () => {
        showMessage('Exportando datos... (Simulado)');
        setTimeout(() => showMessage('Datos exportados exitosamente en data.csv'), 2000);
    };

    const handleLogoutEverywhere = () => {
        showMessage('Sesiones cerradas en todos los demás dispositivos (Simulado)');
    };

    const TABS = [
        { id: 'appearance', label: 'Apariencia y Dashboard', icon: <Palette size={18} /> },
        { id: 'notifications', label: 'Notificaciones', icon: <Bell size={18} /> },
        { id: 'ai', label: 'Inteligencia Artificial', icon: <Bot size={18} /> },
        { id: 'security', label: 'Seguridad', icon: <Shield size={18} /> }
    ];

    if (userData?.role === 'Admin') {
        TABS.push({ id: 'access', label: 'Gestión de Accesos', icon: <Users size={18} /> });
    }

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button className="settings-back-btn" onClick={onBack}>
                    <ArrowLeft size={20} />
                    Volver al Dashboard
                </button>
                <h2 className="settings-title">Configuración</h2>
            </div>
            
            {message.text && (
                <div className={`settings-toast ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="settings-layout">
                {/* Sidebar */}
                <div className="settings-sidebar glass-card">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="settings-content-area">
                    {/* APARIENCIA */}
                    {activeTab === 'appearance' && (
                        <div className="settings-section glass-card fade-in">
                            <div className="settings-section-header">
                                <div className="settings-section-icon"><Palette size={24} /></div>
                                <div>
                                    <h3>Apariencia y Dashboard</h3>
                                    <p>Personaliza cómo se ve Inventory 360 en tu dispositivo.</p>
                                </div>
                            </div>
                            
                            <div className="theme-options">
                                <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => toggleTheme('light')}>
                                    <div className="theme-btn-icon"><Sun size={24} /></div>
                                    <span>Modo Claro</span>
                                    <div className="theme-btn-indicator"></div>
                                </button>
                                <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => toggleTheme('dark')}>
                                    <div className="theme-btn-icon"><Moon size={24} /></div>
                                    <span>Modo Oscuro</span>
                                    <div className="theme-btn-indicator"></div>
                                </button>
                            </div>
                            
                            <hr className="settings-divider" />
                            
                            <div className="settings-form-group">
                                <label>Moneda Predeterminada</label>
                                <select className="settings-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                                    <option value="MXN">Peso Mexicano (MXN)</option>
                                    <option value="USD">Dólar Estadounidense (USD)</option>
                                    <option value="EUR">Euro (EUR)</option>
                                </select>
                                <p className="settings-hint">Afecta visualizaciones sin cambiar valores en la base de datos.</p>
                            </div>

                            <button className="btn-save" onClick={savePreferences}><Save size={16} /> Guardar Preferencias</button>
                        </div>
                    )}

                    {/* NOTIFICACIONES */}
                    {activeTab === 'notifications' && (
                        <div className="settings-section glass-card fade-in">
                            <div className="settings-section-header">
                                <div className="settings-section-icon"><Bell size={24} /></div>
                                <div>
                                    <h3>Notificaciones</h3>
                                    <p>Configura cuándo y cómo recibir alertas del inventario.</p>
                                </div>
                            </div>

                            <div className="settings-toggle-row">
                                <div>
                                    <strong>Alertas de Stock por Correo</strong>
                                    <p className="settings-hint">Recibir correos de resumen de alertas activas</p>
                                </div>
                                <div className={`fluid-toggle ${alertsEnabled ? 'on' : 'off'} ${theme === 'light' ? 'light' : 'dark'}`} onClick={() => setAlertsEnabled(!alertsEnabled)}>
                                    <div className="toggle-track"><div className="toggle-thumb" /></div>
                                </div>
                            </div>

                            <div className="settings-form-group">
                                <label>Umbral General de Stock Crítico (Unidades)</label>
                                <input 
                                    type="number" 
                                    className="settings-input" 
                                    value={criticalThreshold} 
                                    onChange={e => setCriticalThreshold(e.target.value)} 
                                    min="1"
                                />
                                <p className="settings-hint">Los productos por debajo de este nivel serán destacados en rojo.</p>
                            </div>
                            
                            <button className="btn-save" onClick={savePreferences}><Save size={16} /> Guardar Preferencias</button>
                        </div>
                    )}

                    {/* INTELIGENCIA ARTIFICIAL */}
                    {activeTab === 'ai' && (
                        <div className="settings-section glass-card fade-in">
                            <div className="settings-section-header">
                                <div className="settings-section-icon"><Bot size={24} /></div>
                                <div>
                                    <h3>Inteligencia Artificial</h3>
                                    <p>Ajusta el comportamiento del Chatbot y modelos.</p>
                                </div>
                            </div>

                            <div className="settings-form-group">
                                <label>Tono de Respuesta del Chatbot</label>
                                <select className="settings-select" value={aiTone} onChange={e => setAiTone(e.target.value)}>
                                    <option value="Profesional">Formal y Profesional</option>
                                    <option value="Amigable">Casual y Amigable</option>
                                    <option value="Directo">Conciso y Directo</option>
                                </select>
                            </div>
                            
                            <button className="btn-save" onClick={savePreferences}><Save size={16} /> Guardar Preferencias</button>
                        </div>
                    )}

                    {/* SEGURIDAD */}
                    {activeTab === 'security' && (
                        <div className="settings-section glass-card fade-in">
                            <div className="settings-section-header">
                                <div className="settings-section-icon"><Shield size={24} /></div>
                                <div>
                                    <h3>Seguridad y Privacidad</h3>
                                    <p>Protege tu cuenta y gestiona tus datos.</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="settings-form-block">
                                <h4>Cambiar Contraseña</h4>
                                <div className="settings-form-group">
                                    <label>Contraseña Actual</label>
                                    <input type="password" required className="settings-input" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                                </div>
                                <div className="settings-form-group">
                                    <label>Nueva Contraseña (mínimo 6)</label>
                                    <input type="password" required minLength={6} className="settings-input" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                                </div>
                                <div className="settings-form-group">
                                    <label>Confirmar Nueva Contraseña</label>
                                    <input type="password" required minLength={6} className="settings-input" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                                </div>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Cambiando...' : 'Actualizar Contraseña'}
                                </button>
                            </form>

                            <hr className="settings-divider" />

                            <div className="settings-action-row">
                                <div>
                                    <strong>Cerrar otras sesiones</strong>
                                    <p className="settings-hint">Desconecta todos los demás dispositivos activos.</p>
                                </div>
                                <button className="btn-danger-outline" onClick={handleLogoutEverywhere}><LogOut size={16}/> Cerrar Sesiones</button>
                            </div>

                            <div className="settings-action-row">
                                <div>
                                    <strong>Exportar Mis Datos</strong>
                                    <p className="settings-hint">Descarga un archivo CSV con toda tu información.</p>
                                </div>
                                <button className="btn-secondary" onClick={handleExportData}><Download size={16}/> Exportar .CSV</button>
                            </div>
                        </div>
                    )}

                    {/* ACCESOS (ADMIN) */}
                    {activeTab === 'access' && userData?.role === 'Admin' && (
                        <div className="settings-section glass-card fade-in">
                            <div className="settings-section-header">
                                <div className="settings-section-icon"><Users size={24} /></div>
                                <div>
                                    <h3>Gestión de Accesos</h3>
                                    <p>Crea invitaciones y nuevos usuarios para la plataforma.</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateUser} className="settings-form-block">
                                <h4>Crear Nuevo Usuario</h4>
                                <div className="settings-form-group">
                                    <label>Nombre Completo</label>
                                    <input type="text" required className="settings-input" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Ej. Juan Pérez" />
                                </div>
                                <div className="settings-form-group">
                                    <label>Correo Electrónico</label>
                                    <input type="email" required className="settings-input" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="ejemplo@inv360.com" />
                                </div>
                                <div className="settings-form-group">
                                    <label>Contraseña Temporal</label>
                                    <input type="password" minLength={6} required className="settings-input" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="Mínimo 6 caracteres" />
                                </div>
                                <div className="settings-form-group">
                                    <label>Rol del Usuario</label>
                                    <select className="settings-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                        <option value="Vendedor">Vendedor</option>
                                        <option value="Admin">Administrador</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Creando...' : 'Crear Usuario'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
