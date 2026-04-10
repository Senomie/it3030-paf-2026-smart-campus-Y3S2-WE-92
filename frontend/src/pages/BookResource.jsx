import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { NotificationContext } from '../context/NotificationContext';

const BookResource = () => {
    const { id } = useParams();
    const resourceLabel = id ? decodeURIComponent(id) : '';
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext);
    const [purpose, setPurpose] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/bookings', {
                resourceLabel,
                purpose,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
            });
            showNotification('Booking request submitted (PENDING).', 'success');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Booking failed';
            showNotification(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="premium-card" style={{ maxWidth: 560, margin: '24px auto', padding: '28px' }}>
            <h1 style={{ marginTop: 0 }}>Book resource</h1>
            <p style={{ color: 'var(--text-muted)' }}>{resourceLabel}</p>
            <form onSubmit={submit}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Purpose</label>
                <textarea
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={3}
                    style={{ width: '100%', borderRadius: 10, padding: 12, marginBottom: 16, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                />
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Start</label>
                <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ width: '100%', borderRadius: 10, padding: 12, marginBottom: 16, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                />
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>End</label>
                <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{ width: '100%', borderRadius: 10, padding: 12, marginBottom: 20, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                />
                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        padding: '12px 20px',
                        borderRadius: 12,
                        border: 'none',
                        background: 'var(--primary)',
                        color: 'white',
                        fontWeight: 700,
                        cursor: submitting ? 'wait' : 'pointer',
                    }}
                >
                    {submitting ? 'Submitting…' : 'Request booking'}
                </button>
            </form>
        </div>
    );
};

export default BookResource;
