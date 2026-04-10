import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { NotificationContext } from '../context/NotificationContext';

const ReportIssue = () => {
    const { id } = useParams();
    const resource = id ? decodeURIComponent(id) : 'General';
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext);
    const [title, setTitle] = useState(`Issue: ${resource}`);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/tickets', {
                title,
                description: `${description}\n\n(Resource: ${resource})`,
                assigneeId: null,
            });
            showNotification('Ticket created.', 'success');
            navigate(`/ticket/${res.data.id}`);
        } catch (err) {
            showNotification(err.response?.data?.error || err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="premium-card" style={{ maxWidth: 560, margin: '24px auto', padding: 28 }}>
            <h1 style={{ marginTop: 0 }}>Report issue</h1>
            <p style={{ color: 'var(--text-muted)' }}>{resource}</p>
            <form onSubmit={submit}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Title</label>
                <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', borderRadius: 10, padding: 12, marginBottom: 16, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                />
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Description</label>
                <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
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
                    {submitting ? 'Submitting…' : 'Submit ticket'}
                </button>
            </form>
        </div>
    );
};

export default ReportIssue;
