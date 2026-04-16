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
        <div style={{ padding: '0 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div className="premium-card" style={{ 
                maxWidth: 560, 
                margin: '40px auto', 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
                padding: '32px' 
            }}>
                <header style={{ marginBottom: '24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                    <h1 style={{ margin: '0 0 8px 0', color: '#1a3626', fontSize: '1.75rem', fontWeight: 700 }}>
                        Report an Issue
                    </h1>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
                        Resource: <span style={{ fontWeight: 600, color: '#374151' }}>{resource}</span>
                    </p>
                </header>

                <form onSubmit={submit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4b5563', fontSize: '0.95rem' }}>
                            Issue Title
                        </label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ 
                                width: '100%', 
                                boxSizing: 'border-box',
                                borderRadius: '8px', 
                                padding: '12px 16px', 
                                backgroundColor: '#f9fafb', 
                                border: '1px solid #d1d5db', 
                                color: '#1f2937',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4b5563', fontSize: '0.95rem' }}>
                            Description
                        </label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            placeholder="Please provide as much detail as possible..."
                            style={{ 
                                width: '100%', 
                                boxSizing: 'border-box',
                                borderRadius: '8px', 
                                padding: '12px 16px', 
                                backgroundColor: '#f9fafb', 
                                border: '1px solid #d1d5db', 
                                color: '#1f2937',
                                fontSize: '1rem',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            width: '100%',
                            padding: '14px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: submitting ? '#9ca3af' : '#2e8b57',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: submitting ? 'wait' : 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportIssue;