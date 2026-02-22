import React, { useState, useEffect, useRef } from 'react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import {
    FaDollarSign, FaBoxes, FaShoppingCart, FaSyncAlt,
    FaExclamationTriangle, FaTimes, FaSearch, FaUserCircle
} from 'react-icons/fa';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../config/api';

const Dashboard = ({ onLastUpdated, onLogout }) => {
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState({ count: 0, alerts: [] });
    const [demandData, setDemandData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dismissedAlerts, setDismissedAlerts] = useState([]);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, alertsRes, demandRes, categoryRes, recsRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/alerts'),
                    api.get('/dashboard/demand-prediction'),
                    api.get('/dashboard/category-demand'),
                    api.get('/dashboard/recommendations')
                ]);

                setStats(statsRes.data);
                setAlerts(alertsRes.data);
                setDemandData(demandRes.data.data || []);
                setCategoryData(categoryRes.data.data || []);
                setRecommendations(recsRes.data.recommendations || []);

                const now = new Date();
                if (onLastUpdated) onLastUpdated(now);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
        const interval = setInterval(fetchAll, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('es-ES').format(num);
    };

    const dismissAlert = (id) => {
        setDismissedAlerts(prev => [...prev, id]);
    };

    const activeAlerts = alerts.alerts.filter(a => !dismissedAlerts.includes(a._id));

    const ChangeIndicator = ({ value, suffix = '%' }) => {
        if (value === 0 || value === null || value === undefined) {
            return <span className="change-indicator neutral">±0{suffix}</span>;
        }
        const isPositive = value > 0;
        return (
            <span className={`change-indicator ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '+' : ''}{value}{suffix}
            </span>
        );
    };

    const StatSkeleton = () => (
        <div className="stat-card skeleton">
            <div className="skeleton-icon"></div>
            <div style={{ flex: 1 }}>
                <div className="skeleton-text"></div>
                <div className="skeleton-value"></div>
            </div>
        </div>
    );

    const statCards = stats ? [
        {
            icon: <FaDollarSign />,
            iconClass: 'sales',
            label: 'Ventas del Día',
            value: formatCurrency(stats.salesToday),
            subtitle: 'vs. ayer',
            change: stats.salesTodayChange
        },
        {
            icon: <FaBoxes />,
            iconClass: 'stock',
            label: 'Stock Total',
            value: formatNumber(stats.totalStock),
            subtitle: 'unidades',
            change: stats.totalStockChange
        },
        {
            icon: <FaShoppingCart />,
            iconClass: 'active',
            label: 'Productos Activos',
            value: formatNumber(stats.activeProducts),
            subtitle: 'en catálogo',
            change: stats.activeProductsChange
        },
        {
            icon: <FaSyncAlt />,
            iconClass: 'rotation',
            label: 'Rotación Promedio',
            value: `${stats.avgRotation} días`,
            subtitle: 'tiempo de venta',
            change: stats.avgRotationChange
        }
    ] : [];

    const recColors = { green: '#22c55e', blue: '#3b82f6', orange: '#f59e0b', red: '#ef4444' };

    return (
        <div className="dashboard-container">
            {/* Header Row: Breadcrumb + Search + Admin Info */}
            <div className="dashboard-topbar">
                <nav className="breadcrumb">
                    <span className="breadcrumb-item">Inicio</span>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-item active">Dashboard</span>
                </nav>
                <div className="dashboard-topbar-right">
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar productos, SKU, categorías..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="admin-dropdown-wrapper" ref={userMenuRef}>
                        <button
                            className="admin-info"
                            onClick={() => setShowUserMenu(prev => !prev)}
                        >
                            <div className="admin-text">
                                <span className="admin-name">Admin Usuario</span>
                                <span className="admin-email">admin@inv360.com</span>
                            </div>
                            <FaUserCircle className="admin-avatar" />
                            <ChevronDown
                                size={14}
                                className={`admin-chevron ${showUserMenu ? 'open' : ''}`}
                            />
                        </button>
                        {showUserMenu && (
                            <div className="admin-menu">
                                <div className="admin-menu-header">
                                    <FaUserCircle className="menu-avatar" />
                                    <div>
                                        <span className="menu-name">Admin Usuario</span>
                                        <span className="menu-email">admin@inv360.com</span>
                                    </div>
                                </div>
                                <div className="admin-menu-divider"></div>
                                <button className="admin-menu-item" onClick={() => setShowUserMenu(false)}>
                                    <User size={16} />
                                    Mi Perfil
                                </button>
                                <button className="admin-menu-item" onClick={() => setShowUserMenu(false)}>
                                    <Settings size={16} />
                                    Configuración de Cuenta
                                </button>
                                <div className="admin-menu-divider"></div>
                                {onLogout && (
                                    <button className="admin-menu-item logout" onClick={onLogout}>
                                        <LogOut size={16} />
                                        Cerrar Sesión
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Welcome Section */}
            <div className="dashboard-welcome">
                <h2>Bienvenido al Dashboard</h2>
                <p>Vista general de tu inventario e insights generados por IA</p>
            </div>

            {/* Stat Cards */}
            {loading ? (
                <div className="stat-cards-grid">
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                </div>
            ) : (
                <div className="stat-cards-grid">
                    {statCards.map((card, idx) => (
                        <div className="stat-card" key={idx}>
                            <div className="stat-card-header">
                                <div className={`stat-icon ${card.iconClass}`}>
                                    {card.icon}
                                </div>
                                <ChangeIndicator value={card.change} />
                            </div>
                            <span className="stat-label">{card.label}</span>
                            <span className="stat-value">{card.value}</span>
                            <span className="stat-subtitle">{card.subtitle}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts Row: Demand Prediction + Alerts */}
            <div className="dashboard-charts-row">
                {/* Demand Prediction Chart */}
                <div className="glass-card prediction-chart">
                    <div className="card-header">
                        <div className="card-header-icon prediction-icon">
                            <FaSyncAlt />
                        </div>
                        <div>
                            <h3>Predicción de Demanda (IA)</h3>
                            <p className="card-subtitle">Análisis predictivo basado en machine learning</p>
                        </div>
                    </div>
                    <p className="chart-title">Demanda Mensual vs Predicción</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={demandData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                                dataKey="month"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="real"
                                name="Demanda Real"
                                stroke="#3b82f6"
                                strokeWidth={2.5}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                connectNulls={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="prediction"
                                name="Predicción IA"
                                stroke="#22c55e"
                                strokeWidth={2.5}
                                strokeDasharray="5 5"
                                dot={{ fill: '#22c55e', r: 4 }}
                                connectNulls={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Alerts Panel */}
                <div className="glass-card alerts-panel">
                    <div className="alerts-header">
                        <h3>Alertas Activas</h3>
                        <span className="alerts-badge">{activeAlerts.length} alertas</span>
                    </div>
                    <div className="alerts-list">
                        {activeAlerts.length === 0 ? (
                            <div className="no-alerts">
                                <p>✅ No hay alertas activas</p>
                                <p className="no-alerts-sub">Todos los productos tienen stock adecuado</p>
                            </div>
                        ) : (
                            activeAlerts.map((alert) => (
                                <div
                                    key={alert._id}
                                    className={`alert-item ${alert.severity}`}
                                >
                                    <div className="alert-icon-wrapper">
                                        <FaExclamationTriangle />
                                    </div>
                                    <div className="alert-content">
                                        <strong>{alert.name}</strong>
                                        <span className="alert-sku">SKU: {alert.sku}</span>
                                        <span className={`alert-severity ${alert.severity}`}>
                                            {alert.message}
                                        </span>
                                        <span className="alert-stock">
                                            Stock actual: {alert.stock} unidades
                                        </span>
                                    </div>
                                    <button
                                        className="alert-dismiss"
                                        onClick={() => dismissAlert(alert._id)}
                                        aria-label="Dismiss"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Category Demand + Recommendations */}
            <div className="dashboard-bottom-row">
                {/* Category Demand Bar Chart */}
                <div className="glass-card category-chart">
                    <h3 className="chart-title">Demanda por Categoría (Próximos 30 días)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                                dataKey="category"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                            />
                            <Bar
                                dataKey="demand"
                                name="Demanda"
                                fill="#3b82f6"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* AI Recommendations */}
                <div className="glass-card recommendations-section">
                    <h3>Recomendaciones IA</h3>
                    <div className="recommendations-list">
                        {recommendations.length === 0 ? (
                            <p className="no-data">Sin datos suficientes para generar recomendaciones.</p>
                        ) : (
                            recommendations.map((rec, idx) => (
                                <div className="recommendation-item" key={idx}>
                                    <span
                                        className="rec-dot"
                                        style={{ background: recColors[rec.color] || '#3b82f6' }}
                                    ></span>
                                    <div className="rec-text">
                                        <strong>{rec.category}:</strong> {rec.message}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;