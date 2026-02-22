import React, { useState, useEffect } from 'react';
import { FaBoxes, FaCheckCircle, FaDollarSign } from 'react-icons/fa';
import api from '../config/api';

const Dashboard = ({ onLastUpdated }) => {
    const [stats, setStats] = useState({
        totalStock: 0,
        activeProducts: 0,
        totalSales: 0,
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Poll for updates every 5 seconds (Real-time-ish)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setStats(res.data);
                const now = new Date();
                setLastUpdated(now);
                if (onLastUpdated) onLastUpdated(now);
            } catch (err) {
                console.error('Error fetching stats', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    // Formato de números
    const formatNumber = (num) => {
        return new Intl.NumberFormat('es-ES').format(num);
    };

    // Componente de skeleton para las tarjetas
    const StatSkeleton = () => (
        <div className="stat-card skeleton">
            <div className="skeleton-icon"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-value"></div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Inventory 360 Dashboard</h2>
            </div>

            {loading ? (
                <div className="dashboard-grid">
                    <StatSkeleton />
                    <StatSkeleton />
                    <StatSkeleton />
                </div>
            ) : (
                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-icon stock">
                            <FaBoxes />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Stock</span>
                            <span className="stat-value">{formatNumber(stats.totalStock)}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon active">
                            <FaCheckCircle />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Productos Activos</span>
                            <span className="stat-value">{formatNumber(stats.activeProducts)}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon sales">
                            <FaDollarSign />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Ventas Totales</span>
                            <span className="stat-value">{formatNumber(stats.totalSales)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;