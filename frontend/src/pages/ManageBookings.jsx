import React, { useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { NotificationContext } from '../context/NotificationContext';
import PromptDialog from '../components/PromptDialog';

const ManageBookings = () => {
    const { showNotification } = useContext(NotificationContext);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectDialog, setRejectDialog] = useState({ open: false, bookingId: null });

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

    const decide = async (id, approved, reason = null) => {
        try {
            await api.patch(`/bookings/${id}/decision`, { approved, reason: reason || null });
            showNotification(approved ? 'Booking approved.' : 'Booking rejected.', 'success');
            load();
        } catch (e) {
            showNotification(e.response?.data?.error || 'Update failed', 'error');
        }
    };

    const handleReject = (id) => {
        setRejectDialog({ open: true, bookingId: id });
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
                                <button type="button" onClick={() => handleReject(b.id)} style={btnDanger}>Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PromptDialog
                open={rejectDialog.open}
                title="Reject Booking"
                message="Please provide a reason for rejection (optional)."
                placeholder="Rejection reason..."
                confirmLabel="Reject"
                onConfirm={(reason) => {
                    const id = rejectDialog.bookingId;
                    setRejectDialog({ open: false, bookingId: null });
                    decide(id, false, reason);
                }}
                onCancel={() => setRejectDialog({ open: false, bookingId: null })}
            />
        </div>
    );
};

const btnPrimary = {
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    background: '#16a34a',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer',
};

const btnDanger = {
    ...btnPrimary,
    background: '#dc2626',
    color: '#ffffff',
    border: 'none',
};

export default ManageBookings;
