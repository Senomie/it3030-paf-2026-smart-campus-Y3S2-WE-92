import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const TechnicianDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = () => {
        setLoading(true);
        api.get('/tickets/desk').then(res => {
            setTimeout(() => {
                setTickets(res.data);
                setLoading(false);
            }, 1000); 
        }).catch(err => {
            console.error(err);
            setLoading(false);
            showNotification('Failed to load tickets', 'error');
        });
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const assignToMe = async (ticketId) => {
        try {
            await api.put(`/tickets/${ticketId}/assign/${user.id}`);
            fetchTickets();
            showNotification('Ticket successfully claimed for review.', 'success');
        } catch (err) { showNotification('Assignment Failed', 'error'); }
    };

    const resolveTicket = async (ticketId) => {
        const notes = prompt("Enter resolution notes (e.g., Fixed projector bulb):");
        if (notes) {
            try {
                await api.patch(`/tickets/${ticketId}/status`, { status: 'RESOLVED', resolutionNotes: notes });
                fetchTickets();
                showNotification('Ticket marked as resolved!', 'success');
            } catch (err) { 
                console.error("Resolution Error:", err); 
                showNotification('Resolution Update Failed', 'error'); 
            }
        }
    };

    const deleteTicket = async (ticketId) => {
        if (window.confirm("Are you sure you want to completely delete this ticket? This action cannot be undone.")) {
            try {
                await api.delete(`/tickets/${ticketId}`);
                fetchTickets();
                showNotification('Ticket deleted successfully!', 'success');
            } catch (err) { 
                console.error("Delete Error:", err);
                showNotification('Failed to delete ticket', 'error'); 
            }
        }
    };

    // ⭐ NEW: TIME CALCULATION HELPERS ⭐
    const formatTimeDiff = (start, end) => {
        if (!start || !end) return null;
        const diffMs = new Date(end) - new Date(start);
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${diffMins}m`;
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours}h ${mins}m`;
    };

    const calculateOpenTime = (start) => {
        if (!start) return null;
        const diffMs = new Date() - new Date(start);
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${diffMins}m`;
        const hours = Math.floor(diffMins / 60);
        return `${hours}h`;
    };

    const openCount = tickets.filter(t => t.status === 'OPEN').length;
    const progressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

    const cardStyle = {
        flex: 1, minWidth: '200px', background: 'var(--surface)', padding: '25px', borderRadius: '24px',
        boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', transition: 'transform 0.2s', position: 'relative', overflow: 'hidden'
    };
    
    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", -apple-system, sans-serif', minHeight: 'calc(100vh - 70px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>IT & Maintenance Desk</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>Triage, assign, and resolve campus service incidents.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <div style={cardStyle}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444' }} />
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Open Incidents</span>
                    <h3 style={{ fontSize: '36px', fontWeight: '800', margin: '10px 0 0 0', color: 'var(--text-main)' }}>{openCount}</h3>
                </div>
                <div style={cardStyle}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f59e0b' }} />
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>In Progress</span>
                    <h3 style={{ fontSize: '36px', fontWeight: '800', margin: '10px 0 0 0', color: 'var(--text-main)' }}>{progressCount}</h3>
                </div>
                <div style={cardStyle}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10b981' }} />
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Resolved</span>
                    <h3 style={{ fontSize: '36px', fontWeight: '800', margin: '10px 0 0 0', color: 'var(--text-main)' }}>{resolvedCount}</h3>
                </div>
            </div>
            
            <div style={{ background: 'var(--surface)', borderRadius: '24px', boxShadow: 'var(--shadow-soft)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Incident Details</th>
                                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>State</th>
                                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Technician</th>
                                <th style={{ padding: '18px 24px', color: '#475569', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '20px 24px' }}><div className="skeleton" style={{ width: '40px', height: '16px' }}></div></td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div className="skeleton" style={{ width: '180px', height: '18px', marginBottom: '8px' }}></div>
                                            <div className="skeleton" style={{ width: '120px', height: '14px' }}></div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}><div className="skeleton" style={{ width: '90px', height: '26px', borderRadius: '12px' }}></div></td>
                                        <td style={{ padding: '20px 24px' }}><div className="skeleton" style={{ width: '130px', height: '16px' }}></div></td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <div className="skeleton" style={{ width: '70px', height: '32px', borderRadius: '6px' }}></div>
                                                <div className="skeleton" style={{ width: '70px', height: '32px', borderRadius: '6px' }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : tickets.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>#{t.id}</td>
                                    
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '15px' }}>{t.title || 'Untitled Incident'}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', whiteSpace: 'pre-line' }}>
                                            {t.description ? (t.description.length > 60 ? t.description.substring(0, 60) + '...' : t.description) : 'No description provided.'}
                                        </div>
                                        
                                        {/* ⭐ NEW: SLA TIMERS DISPLAY ⭐ */}
                                        <div style={{ marginTop: '10px', fontSize: '12px', display: 'flex', gap: '15px', fontWeight: '500' }}>
                                            {t.firstRespondedAt && (
                                                <span style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                                                    ⏱️ First Response: {formatTimeDiff(t.createdAt, t.firstRespondedAt)}
                                                </span>
                                            )}
                                            {t.resolvedAt && (
                                                <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                                                    ✅ Time to Resolve: {formatTimeDiff(t.createdAt, t.resolvedAt)}
                                                </span>
                                            )}
                                            {!t.resolvedAt && (
                                                <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                                                    ⏳ Open Time: {calculateOpenTime(t.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{ fontWeight: '700', fontSize: '11px', padding: '6px 12px', borderRadius: '30px', letterSpacing: '0.5px',
                                            backgroundColor: t.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.1)' : t.status === 'OPEN' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: t.status === 'RESOLVED' ? '#10b981' : t.status === 'OPEN' ? '#ef4444' : '#f59e0b',
                                            border: `1px solid ${t.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.2)' : t.status === 'OPEN' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                        }}>
                                            {t.status ? t.status.replace('_', ' ') : 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                        {t.assigneeId ? `Tech ID: ${t.assigneeId}` : <span style={{color: 'var(--text-muted)', fontStyle: 'italic', opacity: 0.6}}>Unassigned</span>}
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => navigate(`/ticket/${t.id}`)} style={{ background: 'white', color: '#3b82f6', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'background 0.2s' }} onMouseOver={e=>e.target.style.background='#f1f5f9'} onMouseOut={e=>e.target.style.background='white'}>Details</button>
                                            
                                            {t.status === 'OPEN' && (
                                                <button onClick={() => assignToMe(t.id)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }}>Claim</button>
                                            )}
                                            {t.status === 'IN_PROGRESS' && t.assigneeId === user.id && (
                                                <button onClick={() => resolveTicket(t.id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)' }}>Resolve</button>
                                            )}
                                            {t.status === 'RESOLVED' && (
                                                <button onClick={() => deleteTicket(t.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)' }}>Delete</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && tickets.length === 0 && (
                    <div style={{textAlign: 'center', padding: '60px 20px', color: '#94a3b8'}}>
                        <div style={{fontSize: '48px', marginBottom: '15px'}}>✨</div>
                        <p style={{fontSize: '16px', fontWeight: '500'}}>No incidents reported. All good!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicianDashboard;