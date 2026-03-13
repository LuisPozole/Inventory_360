import React, { useState, useEffect, useRef } from 'react';
import {
    Camera,
    Save,
    X,
    Edit3,
    Mail,
    Phone,
    Shield,
    Calendar,
    User,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import api from '../../config/api';
import './UserProfile.css';

const API_BASE = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).origin
    : 'http://localhost:3000';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState({ text: '', type: '' });
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const fileInputRef = useRef(null);

    // ── Fetch profile on mount ──
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/profile');
            setUser(res.data);
            setForm({
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone || ''
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('No se pudo cargar tu perfil. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    // ── Toast helper ──
    const showToast = (text, type = 'success') => {
        setToast({ text, type });
        setTimeout(() => setToast({ text: '', type: '' }), 4000);
    };

    // ── Save profile changes ──
    const handleSave = async () => {
        if (!form.name.trim()) {
            showToast('El nombre es obligatorio', 'error');
            return;
        }
        if (!form.email.trim() || !form.email.includes('@')) {
            showToast('Ingresa un email válido', 'error');
            return;
        }

        setSaving(true);
        try {
            const res = await api.put('/profile', form);
            setUser(res.data);
            setEditing(false);
            showToast('Perfil actualizado correctamente');
        } catch (err) {
            showToast(err.response?.data?.msg || 'Error al actualizar', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ── Cancel editing ──
    const handleCancel = () => {
        setForm({
            name: user.name,
            email: user.email,
            phone: user.phone || ''
        });
        setEditing(false);
    };

    // ── Upload profile image ──
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
            setUser((prev) => ({ ...prev, profileImage: res.data.profileImage }));
            showToast('Imagen actualizada correctamente');
        } catch (err) {
            showToast('Error al subir la imagen', 'error');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    // ── Format date ──
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // ── Get user initials ──
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('');
    };

    // ════════════════════════════════════════════════════════
    // SKELETON LOADING STATE
    // ════════════════════════════════════════════════════════
    if (loading) {
        return (
            <div className="user-profile-skeleton">
                {/* Avatar skeleton */}
                <div className="user-profile-skeleton-card">
                    <div className="user-skeleton-pulse user-skeleton-circle" />
                    <div className="user-skeleton-pulse user-skeleton-line user-skeleton-line--sm" />
                    <div className="user-skeleton-pulse user-skeleton-line user-skeleton-line--md"
                        style={{ height: '10px', width: '30%' }}
                    />
                </div>
                {/* Fields skeleton */}
                <div className="user-profile-skeleton-card" style={{ alignItems: 'stretch' }}>
                    <div className="user-skeleton-pulse user-skeleton-line" style={{ width: '50%', marginBottom: '16px' }} />
                    {[1, 2, 3, 4].map((i) => (
                        <div className="user-skeleton-field" key={i}>
                            <div className="user-skeleton-pulse user-skeleton-icon" />
                            <div className="user-skeleton-text">
                                <div className="user-skeleton-pulse user-skeleton-line user-skeleton-line--sm"
                                    style={{ height: '10px' }}
                                />
                                <div className="user-skeleton-pulse user-skeleton-line user-skeleton-line--md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════
    // ERROR STATE
    // ════════════════════════════════════════════════════════
    if (error) {
        return (
            <div className="user-profile-error user-fade-in">
                <div className="user-profile-error-icon">
                    <AlertCircle size={28} />
                </div>
                <h3>Error al cargar el perfil</h3>
                <p>{error}</p>
                <button className="user-profile-retry-btn" onClick={fetchProfile}>
                    <RefreshCw size={16} />
                    Reintentar
                </button>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════
    // PROFILE VIEW
    // ════════════════════════════════════════════════════════
    return (
        <div className="user-profile">
            {/* Page header */}
            <div className="user-profile-header">
                <h1>Mi Perfil</h1>
            </div>

            {/* Toast notification */}
            {toast.text && (
                <div className={`user-profile-toast ${toast.type}`}>
                    {toast.type === 'error' ? <AlertCircle size={16} /> : <Save size={16} />}
                    {toast.text}
                </div>
            )}

            {/* ═══ Avatar Card ═══ */}
            <div className="user-profile-avatar-card">
                <div
                    className="user-profile-avatar-wrapper"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {user.profileImage ? (
                        <img
                            src={`${API_BASE}${user.profileImage}`}
                            alt={user.name}
                            className="user-profile-avatar-image"
                        />
                    ) : (
                        <div className="user-profile-avatar-placeholder">
                            {getInitials(user.name)}
                        </div>
                    )}
                    <div className="user-profile-avatar-overlay">
                        {uploading ? (
                            <div className="user-profile-spinner" />
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
                <h3 className="user-profile-avatar-name">{user.name}</h3>
                <span className="user-profile-avatar-role">
                    <Shield size={12} />
                    {user.role}
                </span>
            </div>

            {/* ═══ Info Card ═══ */}
            <div className="user-profile-info-card">
                <div className="user-profile-info-header">
                    <h2>Información Personal</h2>
                    {!editing ? (
                        <button
                            className="user-profile-edit-btn"
                            onClick={() => setEditing(true)}
                        >
                            <Edit3 size={14} />
                            Editar
                        </button>
                    ) : (
                        <div className="user-profile-actions">
                            <button
                                className="user-profile-save-btn"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                <Save size={14} />
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                                className="user-profile-cancel-btn"
                                onClick={handleCancel}
                            >
                                <X size={14} />
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>

                <div className="user-profile-fields">
                    {/* Name */}
                    <div className="user-profile-field">
                        <div className="user-profile-field-icon">
                            <User size={18} />
                        </div>
                        <div className="user-profile-field-content">
                            <label>Nombre Completo</label>
                            {editing ? (
                                <input
                                    type="text"
                                    className="user-profile-input"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Tu nombre"
                                />
                            ) : (
                                <span>{user.name}</span>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="user-profile-field">
                        <div className="user-profile-field-icon">
                            <Mail size={18} />
                        </div>
                        <div className="user-profile-field-content">
                            <label>Correo Electrónico</label>
                            {editing ? (
                                <input
                                    type="email"
                                    className="user-profile-input"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="tu@email.com"
                                />
                            ) : (
                                <span>{user.email}</span>
                            )}
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="user-profile-field">
                        <div className="user-profile-field-icon">
                            <Phone size={18} />
                        </div>
                        <div className="user-profile-field-content">
                            <label>Teléfono</label>
                            {editing ? (
                                <input
                                    type="tel"
                                    className="user-profile-input"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="(442) 123-4567"
                                />
                            ) : (
                                <span>{user.phone || 'No configurado'}</span>
                            )}
                        </div>
                    </div>

                    {/* Role (read-only) */}
                    <div className="user-profile-field">
                        <div className="user-profile-field-icon">
                            <Shield size={18} />
                        </div>
                        <div className="user-profile-field-content">
                            <label>Rol</label>
                            <span>{user.role}</span>
                        </div>
                    </div>

                    {/* Member since (read-only) */}
                    <div className="user-profile-field">
                        <div className="user-profile-field-icon">
                            <Calendar size={18} />
                        </div>
                        <div className="user-profile-field-content">
                            <label>Miembro desde</label>
                            <span>{formatDate(user.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
