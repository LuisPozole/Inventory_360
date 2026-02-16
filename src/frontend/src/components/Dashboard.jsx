import React, { useState, useEffect } from 'react';

import api from '../config/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStock: 0,
        activeProducts: 0,
        totalSales: 0
    });
    const [loading, setLoading] = useState(true);

    // Poll for updates every 5 seconds (Real-time-ish)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel" style={{ margin: '20px' }}>
            <h2 style={{ margin: 0, marginBottom: '20px' }}>Inventory 360 Dashboard</h2>

            <div className="dashboard-grid">
                <div className="glass-panel stat-card">
                    <div style={{ color: 'var(--text-dim)', marginBottom: '10px' }}>Total Stock</div>
                    <div className="stat-value">{stats.totalStock}</div>
                </div>

                <div className="glass-panel stat-card">
                    <div style={{ color: 'var(--text-dim)', marginBottom: '10px' }}>Productos Activos</div>
                    <div className="stat-value">{stats.activeProducts}</div>
                </div>

                <div className="glass-panel stat-card">
                    <div style={{ color: 'var(--text-dim)', marginBottom: '10px' }}>Ventas Totales</div>
                    <div className="stat-value">{stats.totalSales}</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
