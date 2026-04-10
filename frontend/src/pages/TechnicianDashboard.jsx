import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { NotificationContext } from '../context/NotificationContext';

const TechnicianDashboard = () => {
    const { showNotification } = useContext(NotificationContext);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/tickets/desk');
                setRows(res.data);
            } catch (e) {
                showNotification(e.response?.data?.error || 'Failed to load desk', 'error');
            } finally {
                setLoading(false);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: 48 }}>Loading…</div>;
    }

    return (
        <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 20px' }}>
            <h1>Service desk</h1>
            <p style={{ color: 'var(--text-muted)' }}>Tickets that are not closed.</p>
            {rows.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Nothing on the desk.</p>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {rows.map((t) => (
                        <div key={t.id} className="premium-card" style={{ padding: 16 }}>
                            <Link to={`/ticket/${t.id}`} style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                                #{t.id} — {t.title}
                            </Link>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{t.status}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TechnicianDashboard;
