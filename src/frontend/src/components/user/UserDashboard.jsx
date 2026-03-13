import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Package,
    ShoppingBag,
    RotateCw,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    CheckCircle,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import api from '../../config/api';
import './UserDashboard.css';

const UserDashboard = ({ userName }) => {
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, alertsRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/dashboard/alerts')
            ]);
            setStats(statsRes.data);
            setAlerts(alertsRes.data);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setError('No se pudieron cargar los datos del dashboard.');
        } finally {
            setLoading(false);
        }
    };

    // ── Format currency ──
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // ── Format number with commas ──
    const formatNumber = (value) => {
        return new Intl.NumberFormat('es-MX').format(value);
    };

    // ── Change indicator component ──
    const ChangeIndicator = ({ value }) => {
        if (value === undefined || value === null || value === 0) {
            return (
                <span className="user-dashboard-kpi-change user-dashboard-kpi-change--neutral">
                    <Minus size={12} />
                    Sin cambio
                </span>
            );
        }
        if (value > 0) {
            return (
                <span className="user-dashboard-kpi-change user-dashboard-kpi-change--up">
                    <TrendingUp size={12} />
                    +{value}%
                </span>
            );
        }
        return (
            <span className="user-dashboard-kpi-change user-dashboard-kpi-change--down">
                <TrendingDown size={12} />
                {value}%
            </span>
        );
    };

    // ── Get greeting based on time ──
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 19) return 'Buenas tardes';
        return 'Buenas noches';
    };

    // ════════════════════════════════════════════════════════
    // SKELETON LOADING
    // ════════════════════════════════════════════════════════
    if (loading) {
        return (
            <div className="user-dashboard-skeleton">
                {/* Header skeleton */}
                <div>
                    <div className="user-skeleton-pulse user-skeleton-line" style={{ width: '60%', height: '20px', marginBottom: '8px' }} />
                    <div className="user-skeleton-pulse user-skeleton-line" style={{ width: '40%', height: '14px' }} />
                </div>

                {/* KPI skeletons */}
                <div className="user-dashboard-skeleton-kpis">
                    {[1, 2, 3, 4].map((i) => (
                        <div className="user-dashboard-skeleton-kpi" key={i}>
                            <div className="user-skeleton-pulse user-dashboard-skeleton-icon" />
                            <div className="user-dashboard-skeleton-text">
                                <div className="user-skeleton-pulse user-dashboard-skeleton-line user-dashboard-skeleton-line--sm" />
                                <div className="user-skeleton-pulse user-dashboard-skeleton-line user-dashboard-skeleton-line--lg" />
                                <div className="user-skeleton-pulse user-dashboard-skeleton-line user-dashboard-skeleton-line--sm" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Alerts skeleton */}
                <div className="user-dashboard-skeleton-alerts">
                    <div className="user-skeleton-pulse user-dashboard-skeleton-line" style={{ width: '40%', height: '18px', marginBottom: '8px' }} />
                    {[1, 2, 3].map((i) => (
                        <div className="user-dashboard-skeleton-alert" key={i}>
                            <div className="user-skeleton-pulse user-dashboard-skeleton-dot" />
                            <div className="user-dashboard-skeleton-text" style={{ flex: 1 }}>
                                <div className="user-skeleton-pulse user-dashboard-skeleton-line" style={{ width: '70%' }} />
                                <div className="user-skeleton-pulse user-dashboard-skeleton-line user-dashboard-skeleton-line--sm" />
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
            <div className="user-dashboard-error user-fade-in">
                <div className="user-dashboard-error-icon">
                    <AlertCircle size={28} />
                </div>
                <h3>Error al cargar el dashboard</h3>
                <p>{error}</p>
                <button className="user-dashboard-retry-btn" onClick={fetchDashboard}>
                    <RefreshCw size={16} />
                    Reintentar
                </button>
            </div>
        );
    }

    // ── KPI cards data ──
    const kpis = [
        {
            label: 'Ventas Hoy',
            value: formatCurrency(stats?.salesToday || 0),
            change: stats?.salesTodayChange,
            icon: DollarSign,
            variant: 'sales'
        },
        {
            label: 'Stock Total',
            value: formatNumber(stats?.totalStock || 0),
            change: stats?.totalStockChange,
            icon: Package,
            variant: 'stock'
        },
        {
            label: 'Productos Activos',
            value: formatNumber(stats?.activeProducts || 0),
            change: stats?.activeProductsChange,
            icon: ShoppingBag,
            variant: 'products'
        },
        {
            label: 'Rotación Prom.',
            value: `${stats?.avgRotation || 0} días`,
            change: stats?.avgRotationChange,
            icon: RotateCw,
            variant: 'rotation'
        }
    ];

    // ════════════════════════════════════════════════════════
    // DASHBOARD VIEW
    // ════════════════════════════════════════════════════════
    return (
        <div className="user-dashboard">
            {/* ═══ Header ═══ */}
            <div className="user-dashboard-header">
                <h1>{getGreeting()}, {userName || 'Vendedor'}</h1>
                <p className="user-dashboard-subtitle">
                    Aquí tienes un resumen rápido del inventario
                </p>
            </div>

            {/* ═══ KPI Cards ═══ */}
            <div className="user-dashboard-kpis">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div className="user-dashboard-kpi" key={kpi.label}>
                            <div className={`user-dashboard-kpi-icon user-dashboard-kpi-icon--${kpi.variant}`}>
                                <Icon />
                            </div>
                            <div className="user-dashboard-kpi-body">
                                <span className="user-dashboard-kpi-label">{kpi.label}</span>
                                <span className="user-dashboard-kpi-value">{kpi.value}</span>
                                <ChangeIndicator value={kpi.change} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ═══ Alerts Section ═══ */}
            <div className="user-dashboard-alerts">
                <div className="user-dashboard-alerts-header">
                    <h2>
                        <AlertTriangle size={20} />
                        Alertas de Stock
                        {alerts?.count > 0 && (
                            <span className="user-dashboard-alerts-badge">{alerts.count}</span>
                        )}
                    </h2>
                </div>

                {alerts?.alerts?.length > 0 ? (
                    <div className="user-dashboard-alerts-list">
                        {alerts.alerts.map((alert) => (
                            <div
                                key={alert._id}
                                className={`user-dashboard-alert-item user-dashboard-alert-item--${alert.severity}`}
                            >
                                <div className={`user-dashboard-alert-dot user-dashboard-alert-dot--${alert.severity}`} />
                                <div className="user-dashboard-alert-info">
                                    <div className="user-dashboard-alert-name">{alert.name}</div>
                                    <div className="user-dashboard-alert-meta">
                                        <span>{alert.sku}</span>
                                        <span>·</span>
                                        <span>{alert.category}</span>
                                    </div>
                                </div>
                                <div className={`user-dashboard-alert-stock user-dashboard-alert-stock--${alert.severity}`}>
                                    {alert.stock} / {alert.threshold}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="user-dashboard-alerts-empty">
                        <CheckCircle size={32} />
                        <p>Todo en orden — no hay alertas de stock activas</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
