import React, { useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { NotificationContext } from '../context/NotificationContext';

const ManageBookings = () => {
    const { showNotification } = useContext(NotificationContext);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings/pending');
            setRows(res.data);
        } catch (e) {
            showNotification(e.response?.data?.error || 'Failed to load bookings', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const decide = async (id, approved) => {
        const reason = approved ? null : window.prompt('Rejection reason (optional):') || '';
        try {
            await api.patch(`/bookings/${id}/decision`, { approved, reason: reason || null });
            showNotification(approved ? 'Booking approved.' : 'Booking rejected.', 'success');
            load();
        } catch (e) {
            showNotification(e.response?.data?.error || 'Update failed', 'error');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: 48 }}>Loading…</div>;
    }

    return (
        <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 20px' }}>
            <h1>Pending bookings</h1>
            {rows.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No pending requests.</p>
            ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                    {rows.map((b) => (
                        <div key={b.id} className="premium-card" style={{ padding: 20 }}>
                            <div style={{ fontWeight: 700 }}>{b.resourceLabel}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
                                User #{b.userId} · {b.status}
                            </div>
                            <p style={{ margin: '12px 0' }}>{b.purpose}</p>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                {b.startTime} → {b.endTime}
                            </div>
                            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => decide(b.id, true)} style={btnPrimary}>Approve</button>
                                <button type="button" onClick={() => decide(b.id, false)} style={btnDanger}>Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const btnPrimary = {
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'var(--primary)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
};

const btnDanger = {
    ...btnPrimary,
    background: 'rgba(239, 68, 68, 0.25)',
    color: '#fecaca',
    border: '1px solid rgba(239, 68, 68, 0.4)',
};

export default ManageBookings;
