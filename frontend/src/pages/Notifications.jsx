import React, { useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const Notifications = () => {
    const { user } = useContext(AuthContext);
    const { error: showError, success: showSuccess } = useContext(NotificationContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMsg, setErrorMsg] = useState(null);

    const load = useCallback(async (isRetry = false) => {
        if (!user?.id) {
            setErrorMsg('User not authenticated');
            setLoading(false);
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await api.get(`/notifications/user/${user.id}`);
            setItems(res.data || []);
            setRetryCount(0);
        } catch (e) {
            const errorText = e.response?.data?.error || e.message || 'Failed to load notifications';
            setErrorMsg(errorText);
            
            if (isRetry) {
                showError(errorText, 5000);
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id, showError]);

    useEffect(() => {
        load();
    }, [user?.id, load]);

    const retry = () => {
        setRetryCount(prev => prev + 1);
        load(true);
    };

    const markRead = async (n) => {
        try {
            await api.patch(`/notifications/${n.id}/read`);
            showSuccess('Marked as read');
            await load();
        } catch (e) {
            showError(e.response?.data?.error || 'Failed to mark as read', 5000);
        }
    };

    const remove = async (n) => {
        try {
            await api.delete(`/notifications/${n.id}`);
            showSuccess('Notification deleted');
            await load();
        } catch (e) {
            showError(e.response?.data?.error || 'Failed to delete notification', 5000);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: 48, padding: '0 20px' }}>
                <div style={{ marginBottom: 16 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        border: '3px solid rgba(59,130,246,0.2)',
                        borderTop: '3px solid rgb(59,130,246)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto',
                        marginBottom: 16
                    }} />
                </div>
                <p style={{ color: 'var(--text-muted)' }}>Loading notifications...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div style={{ maxWidth: 720, margin: '24px auto', padding: '0 20px' }}>
                <h1>Notifications</h1>
                <div style={{
                    padding: 20,
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 10,
                    marginTop: 20
                }}>
                    <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 12 }}>⚠ Error Loading Notifications</div>
                    <p style={{ margin: '0 0 16px 0', color: '#7f1d1d' }}>{errorMsg}</p>
                    <button
                        type="button"
                        onClick={retry}
                        style={{
                            padding: '10px 16px',
                            background: 'rgb(239,68,68)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 14
                        }}
                    >
                        Retry ({retryCount}/3)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 720, margin: '24px auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>Notifications</h1>
                <button
                    type="button"
                    onClick={() => load()}
                    style={{
                        padding: '8px 12px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        color: 'var(--text-main)'
                    }}
                    title="Refresh notifications"
                >
                    ↻ Refresh
                </button>
            </div>

            {items.length === 0 ? (
                <div style={{
                    padding: 40,
                    textAlign: 'center',
                    background: 'var(--surface)',
                    borderRadius: 10,
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>You have no notifications</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {items.map((n) => (
                        <div
                            key={n.id}
                            className="premium-card"
                            style={{
                                padding: 16,
                                opacity: n.read ? 0.7 : 1,
                                borderLeft: `3px solid ${n.read ? 'transparent' : 'var(--primary)'}`,
                                background: n.read ? 'rgba(0,0,0,0.02)' : 'var(--surface)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>{n.title}</div>
                                {!n.read && <span style={{ fontSize: 10, background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: 3 }}>NEW</span>}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                                {n.type} • {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}
                            </div>
                            <p style={{ margin: '8px 0 12px 0', lineHeight: 1.5 }}>{n.message}</p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {!n.read && (
                                    <button
                                        type="button"
                                        onClick={() => markRead(n)}
                                        style={{
                                            ...btn,
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none'
                                        }}
                                    >
                                        Mark read
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => remove(n)}
                                    style={{
                                        ...btn,
                                        background: 'rgba(239,68,68,0.1)',
                                        color: '#dc2626',
                                        border: '1px solid rgba(239,68,68,0.3)'
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const btn = {
    padding: '8px 14px',
    borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-main)',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
};

export default Notifications;

export default Notifications;
