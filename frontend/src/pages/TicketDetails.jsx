import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const TicketDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [detail, setDetail] = useState(null);
    const [comment, setComment] = useState('');
    const [status, setStatus] = useState('OPEN');
    const staff = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TECHNICIAN';

    const load = async () => {
        const res = await api.get(`/tickets/${id}`);
        setDetail(res.data);
        setStatus(res.data.ticket.status);
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get(`/tickets/${id}`);
                if (!cancelled) {
                    setDetail(res.data);
                    setStatus(res.data.ticket.status);
                }
            } catch (e) {
                if (!cancelled) {
                    showNotification(e.response?.data?.error || 'Failed to load ticket', 'error');
                }
            }
        })();
        return () => { cancelled = true; };
    }, [id, showNotification]);

    const sendComment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/tickets/${id}/comments`, { body: comment });
            setComment('');
            showNotification('Comment added.', 'success');
            load();
        } catch (e) {
            showNotification(e.response?.data?.error || 'Failed', 'error');
        }
    };

    const saveStatus = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/tickets/${id}/status`, { status });
            showNotification('Status updated.', 'success');
            load();
        } catch (e) {
            showNotification(e.response?.data?.error || 'Forbidden or invalid', 'error');
        }
    };

    if (!detail) {
        return <div style={{ textAlign: 'center', marginTop: 48 }}>Loading…</div>;
    }

    const { ticket, comments } = detail;

    return (
        <div style={{ maxWidth: 720, margin: '24px auto', padding: '0 20px' }}>
            <div className="premium-card" style={{ padding: 24, marginBottom: 16 }}>
                <h1 style={{ marginTop: 0 }}>{ticket.title}</h1>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Status: {ticket.status}</div>
                <p style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
                {staff && (
                    <form onSubmit={saveStatus} style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{ fontWeight: 600 }}>Set status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={{ padding: 10, borderRadius: 8, background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                        >
                            {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <button type="submit" style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700 }}>
                            Save
                        </button>
                    </form>
                )}
            </div>
            <div className="premium-card" style={{ padding: 24 }}>
                <h2 style={{ marginTop: 0 }}>Comments</h2>
                {comments.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No comments yet.</p>}
                {comments.map((c) => (
                    <div key={c.id} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>User #{c.authorId} · {c.createdAt}</div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{c.body}</div>
                    </div>
                ))}
                <form onSubmit={sendComment} style={{ marginTop: 16 }}>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        required
                        placeholder="Add a comment…"
                        style={{ width: '100%', borderRadius: 10, padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                    />
                    <button type="submit" style={{ marginTop: 10, padding: '10px 16px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700 }}>
                        Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TicketDetails;
