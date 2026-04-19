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


        try {
            const res = await api.post('/tickets', {
                title,
                description: `${description}\n\n(Resource: ${resource})`,
                assigneeId: null,
            });
            showNotification('Ticket created.', 'success');
            navigate(`/ticket/${res.data.id}`);
        } catch (err) {

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

            </div>
        </div>
    );
};

export default ReportIssue;