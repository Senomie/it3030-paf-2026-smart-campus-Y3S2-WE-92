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
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '64px', color: '#6b7280' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Loading workspace...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <header style={{ marginBottom: '32px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                <h1 style={{ color: '#1a3626', margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 700 }}>Service Desk</h1>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '1.05rem' }}>Active tickets pending resolution.</p>
            </header>

            {rows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '12px', color: '#6b7280' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>Nothing on the desk.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {rows.map((t) => (
                        <div key={t.id} className="premium-card" style={{ 
                            padding: '20px 24px', 
                            backgroundColor: '#ffffff',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            borderLeft: '5px solid #2e8b57', 
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <Link to={`/ticket/${t.id}`} style={{ 
                                    fontWeight: 600, 
                                    color: '#1a3626', 
                                    textDecoration: 'none',
                                    fontSize: '1.15rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <span style={{ color: '#9ca3af', fontSize: '1rem', fontWeight: 500 }}>#{t.id}</span>
                                    {t.title}
                                </Link>
                            </div>
                            <div style={{ 
                                fontSize: '0.85rem', 
                                fontWeight: 600, 
                                backgroundColor: '#e6f4ea', 
                                color: '#137333', 
                                padding: '6px 14px', 
                                borderRadius: '9999px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                whiteSpace: 'nowrap'
                            }}>
                                {t.status}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TechnicianDashboard;