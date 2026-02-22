import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, Save, X, Edit3, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { FaUserCircle } from 'react-icons/fa';
import api from '../config/api';
import './Profile.css';

const Profile = ({ onBack }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const fileInputRef = useRef(null);

    const API_BASE = import.meta.env.VITE_API_URL
        ? new URL(import.meta.env.VITE_API_URL).origin
        : 'http://localhost:3000';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile');
            setUser(res.data);
            setForm({ name: res.data.name, email: res.data.email, phone: res.data.phone || '' });
        } catch (err) {
            console.error('Error fetching profile:', err);
            showMessage('Error al cargar el perfil', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            showMessage('El nombre es obligatorio', 'error');
            return;
        }
        if (!form.email.trim() || !form.email.includes('@')) {
            showMessage('Ingresa un email válido', 'error');
            return;
        }

        setSaving(true);
        try {
            const res = await api.put('/profile', form);
            setUser(res.data);
            setEditing(false);
            showMessage('Perfil actualizado correctamente');
        } catch (err) {
            showMessage(err.response?.data?.msg || 'Error al actualizar', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setForm({ name: user.name, email: user.email, phone: user.phone || '' });
        setEditing(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        setUploading(true);
        try {
            const res = await api.post('/profile/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(prev => ({ ...prev, profileImage: res.data.profileImage }));
            showMessage('Imagen actualizada correctamente');
        } catch (err) {
            showMessage('Error al subir la imagen', 'error');
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-loading">
                    <div className="profile-spinner"></div>
                    <p>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* Header */}
            <div className="profile-header">
                <button className="profile-back-btn" onClick={onBack}>
                    <ArrowLeft size={20} />
                    Volver al Dashboard
                </button>
                <h2 className="profile-title">Mi Perfil</h2>
            </div>

            {/* Message Toast */}
            {message.text && (
                <div className={`profile-toast ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-content">
                {/* Avatar Section */}
                <div className="profile-avatar-section glass-card">
                    <div className="profile-avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                        {user.profileImage ? (
                            <img
                                src={`${API_BASE}${user.profileImage}`}
                                alt="Avatar"
                                className="profile-avatar-img"
                            />
                        ) : (
                            <FaUserCircle className="profile-avatar-placeholder" />
                        )}
                        <div className="profile-avatar-overlay">
                            {uploading ? (
                                <div className="profile-spinner small"></div>
                            ) : (
                                <Camera size={24} />
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <h3 className="profile-avatar-name">{user.name}</h3>
                    <span className="profile-avatar-role">{user.role}</span>
                </div>

                {/* Info Section */}
                <div className="profile-info-section glass-card">
                    <div className="profile-info-header">
                        <h3>Información Personal</h3>
                        {!editing ? (
                            <button className="profile-edit-btn" onClick={() => setEditing(true)}>
                                <Edit3 size={16} />
                                Editar Perfil
                            </button>
                        ) : (
                            <div className="profile-edit-actions">
                                <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                                    <Save size={16} />
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button className="profile-cancel-btn" onClick={handleCancel}>
                                    <X size={16} />
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-fields">
                        <div className="profile-field">
                            <div className="profile-field-icon">
                                <FaUserCircle />
                            </div>
                            <div className="profile-field-content">
                                <label>Nombre Completo</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="profile-input"
                                        placeholder="Tu nombre"
                                    />
                                ) : (
                                    <span>{user.name}</span>
                                )}
                            </div>
                        </div>

                        <div className="profile-field">
                            <div className="profile-field-icon">
                                <Mail size={18} />
                            </div>
                            <div className="profile-field-content">
                                <label>Correo Electrónico</label>
                                {editing ? (
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="profile-input"
                                        placeholder="tu@email.com"
                                    />
                                ) : (
                                    <span>{user.email}</span>
                                )}
                            </div>
                        </div>

                        <div className="profile-field">
                            <div className="profile-field-icon">
                                <Phone size={18} />
                            </div>
                            <div className="profile-field-content">
                                <label>Teléfono</label>
                                {editing ? (
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="profile-input"
                                        placeholder="(442) 123-4567"
                                    />
                                ) : (
                                    <span>{user.phone || 'No configurado'}</span>
                                )}
                            </div>
                        </div>

                        <div className="profile-field">
                            <div className="profile-field-icon">
                                <Shield size={18} />
                            </div>
                            <div className="profile-field-content">
                                <label>Rol</label>
                                <span className="profile-role-badge">{user.role}</span>
                            </div>
                        </div>

                        <div className="profile-field">
                            <div className="profile-field-icon">
                                <Calendar size={18} />
                            </div>
                            <div className="profile-field-content">
                                <label>Miembro desde</label>
                                <span>{formatDate(user.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
