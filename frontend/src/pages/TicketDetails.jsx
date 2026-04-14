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
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '64px', color: '#6b7280', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Loading ticket details...</div>
            </div>
        );
    }

    const { ticket, comments } = detail;

    return (
        <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* Ticket Details Card */}
            <div className="premium-card" style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
                padding: '32px', 
                marginBottom: '24px' 
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, color: '#1a3626', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2, flex: 1 }}>
                        {ticket.title}
                    </h1>
                    <div style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 600, 
                        backgroundColor: '#e6f4ea', 
                        color: '#137333', 
                        padding: '6px 16px', 
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {ticket.status}
                    </div>
                </div>

                <div style={{ 
                    backgroundColor: '#f9fafb', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    border: '1px solid #f3f4f6',
                    marginBottom: staff ? '24px' : '0'
                }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#374151', lineHeight: 1.6, fontSize: '1.05rem' }}>
                        {ticket.description}
                    </p>
                </div>

                {staff && (
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                        <form onSubmit={saveStatus} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ fontWeight: 600, color: '#4b5563', fontSize: '0.95rem' }}>Update Status:</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                style={{ 
                                    padding: '10px 16px', 
                                    borderRadius: '8px', 
                                    backgroundColor: '#ffffff', 
                                    color: '#1f2937', 
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <button type="submit" style={{ 
                                padding: '10px 20px', 
                                borderRadius: '8px', 
                                border: 'none', 
                                backgroundColor: '#1a3626', 
                                color: 'white', 
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}>
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Comments Card */}
            <div className="premium-card" style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
                padding: '32px' 
            }}>
                <h2 style={{ margin: '0 0 24px 0', color: '#1a3626', fontSize: '1.4rem', fontWeight: 700 }}>Discussion</h2>
                
                <div style={{ marginBottom: '24px' }}>
                    {comments.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>No comments yet. Be the first to start the discussion.</p>
                    ) : (
                        comments.map((c) => (
                            <div key={c.id} style={{ 
                                borderBottom: '1px solid #f3f4f6', 
                                paddingBottom: '20px',
                                marginBottom: '20px' 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{ 
                                        width: '32px', 
                                        height: '32px', 
                                        backgroundColor: '#e5e7eb', 
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#6b7280',
                                        fontWeight: 'bold',
                                        fontSize: '0.8rem'
                                    }}>
                                        #{c.authorId}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>
                                        User #{c.authorId} <span style={{ margin: '0 6px', color: '#d1d5db' }}>•</span> {c.createdAt}
                                    </div>
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap', color: '#374151', lineHeight: 1.5, paddingLeft: '40px' }}>
                                    {c.body}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={sendComment} style={{ 
                    backgroundColor: '#f9fafb', 
                    padding: '20px', 
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb'
                }}>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        required
                        placeholder="Type your comment here..."
                        style={{ 
                            width: '100%', 
                            boxSizing: 'border-box',
                            borderRadius: '8px', 
                            padding: '14px', 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #d1d5db', 
                            color: '#1f2937',
                            fontSize: '0.95rem',
                            resize: 'vertical',
                            outline: 'none',
                            fontFamily: 'inherit',
                            marginBottom: '12px'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ 
                            padding: '10px 24px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            backgroundColor: '#2e8b57', 
                            color: 'white', 
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }}>
                            Post Comment
                        </button>
                    </div>
                </form>
            </div>
            
        </div>
    );
};

export default TicketDetails;