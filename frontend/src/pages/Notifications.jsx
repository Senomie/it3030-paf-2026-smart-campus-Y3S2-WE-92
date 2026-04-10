import React, { useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const Notifications = () => {
    const { user } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/notifications/user/${user.id}`);
            setItems(res.data);
        } catch (e) {
            showNotification(e.response?.data?.error || 'Failed to load notifications', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [user?.id]);

    const markRead = async (n) => {
        try {
            await api.patch(`/notifications/${n.id}/read`);
            showNotification('Marked read.', 'success');
            load();
        } catch (e) {
            showNotification(e.response?.data?.error || 'Failed', 'error');
        }
    };

    const remove = async (n) => {
        try {
            await api.delete(`/notifications/${n.id}`);
            showNotification('Removed.', 'success');
            load();
        } catch (e) {
            showNotification(e.response?.data?.error || 'Failed', 'error');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: 48 }}>Loading…</div>;
    }

    return (
        <div style={{ maxWidth: 720, margin: '24px auto', padding: '0 20px' }}>
            <h1>Notifications</h1>
            {items.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You have no notifications.</p>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {items.map((n) => (
                        <div
                            key={n.id}
                            className="premium-card"
                            style={{
                                padding: 20,
                                opacity: n.read ? 0.75 : 1,
                                borderLeft: n.read ? '3px solid transparent' : '3px solid var(--primary)',
                            }}
                        >
                            <div style={{ fontWeight: 700 }}>{n.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{n.type} · {n.createdAt}</div>
                            <p style={{ margin: '12px 0' }}>{n.message}</p>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {!n.read && (
                                    <button type="button" onClick={() => markRead(n)} style={btn}>
                                        Mark read
                                    </button>
                                )}
                                <button type="button" onClick={() => remove(n)} style={{ ...btn, background: 'rgba(239,68,68,0.2)', color: '#fecaca' }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const btn = {
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-main)',
    fontWeight: 600,
    cursor: 'pointer',
};

export default Notifications;
