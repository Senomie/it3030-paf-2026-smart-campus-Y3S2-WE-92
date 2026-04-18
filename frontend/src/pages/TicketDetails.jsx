import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [deleteCommentDialog, setDeleteCommentDialog] = useState({ open: false, commentId: null });
    const [statusDialog, setStatusDialog] = useState({ open: false, newStatus: null });

    const fetchData = useCallback(async () => {
        try {
            // FIX 1: The backend returns BOTH the ticket and comments in one single object
            const response = await api.get(`/tickets/${id}`);
            setTicket(response.data.ticket);
            setComments(response.data.comments || []);
            
            // Note: If you haven't built a GET attachments endpoint in Java, 
            // we wrap this in a try/catch so it doesn't crash the whole page if it fails.
            try {
                const aRes = await api.get(`/tickets/${id}/attachments`);
                setAttachments(aRes.data);
            } catch (attErr) {
                console.log("Attachments endpoint not found or empty.");
            }
            
        } catch(err) {
            showNotification('Error loading ticket details', 'error');
        }
    }, [id, showNotification]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            // FIX 2: The Java AddCommentRequest expects a field called 'body', not 'content'
            // The backend automatically extracts the user ID from the JWT token, so we don't send it.
            await api.post(`/tickets/${id}/comments`, { body: newComment });
            setNewComment('');
            fetchData();
            showNotification('Comment posted', 'success');
        } catch(e) { showNotification('Failed to post comment', 'error'); }
    };

    const handleDeleteComment = async (cid) => {
        setDeleteCommentDialog({ open: true, commentId: cid });
    };

    const confirmDeleteComment = async () => {
        const cid = deleteCommentDialog.commentId;
        setDeleteCommentDialog({ open: false, commentId: null });
        try {
            await api.delete(`/tickets/comments/${cid}`);
            fetchData();
            showNotification('Comment deleted', 'success');
        } catch(e) { showNotification('Failed to delete comment', 'error'); }
    };

    if (!ticket) return <div style={{padding: '50px'}}>Loading...</div>;

    return (
        <>
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
            <button 
                onClick={() => navigate(-1)} 
                style={{ 
                    background: 'transparent', border: 'none', color: 'var(--text-muted)', 
                    cursor: 'pointer', fontWeight: 'bold', marginBottom: '25px', 
                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' 
                }}
            >
                &larr; Back to Dashboard
            </button>
            
            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ background: '#1a1a1a', padding: '40px', color: 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', opacity: 0.8 }}>Ticket Details</div>
                    {/* FIX 3: Use ticket.title since category no longer exists as a separate column */}
                    <h2 style={{ margin: 0, fontSize: '32px', letterSpacing: '-1px', lineHeight: '1.2' }}>#{ticket.id}: {ticket.title}</h2>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
                        <span style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px' }}>Status: <strong>{ticket.status.replace('_', ' ')}</strong></span>
                    </div>
                </div>

                <div style={{ padding: '40px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '30px' }}>
                        <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary)', fontSize: '14px', textTransform: 'uppercase' }}>Description & Information</h4>
                        {/* FIX 4: whiteSpace pre-wrap ensures our formatted description shows line breaks correctly */}
                        <p style={{ margin: '0 0 20px 0', lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
                    </div>

            {user.role !== 'ROLE_USER' && (
                <div style={{
                    marginTop: '20px', padding: '20px', 
                    background: '#f5f5f5', 
                    borderRadius: '10px', border: '1px solid #dddddd',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '20px'
                }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
                        🛠️ <span style={{color: 'var(--primary)'}}>Technician Control</span> • Override Status
                    </label>
                    <select value={ticket.status} className="premium-input" style={{ width: 'auto', padding: '8px 40px 8px 15px', margin: 0 }} onChange={(e) => {
                        const newStatus = e.target.value;
                        setStatusDialog({ open: true, newStatus });
                    }}>
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="REJECTED">REJECTED</option>
                    </select>
                </div>
            )}
            
            {attachments.length > 0 && (
                <div style={{marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--border)'}}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text)' }}>Attachments (Evidence)</h4>
                    <div style={{
                        display: 'flex', gap: '20px', flexWrap: 'wrap', 
                        padding: '25px', background: 'rgba(255,255,255,0.01)', 
                        borderRadius: '16px', border: '1px solid var(--border)'
                    }}>
                        {attachments.map(att => (
                            <div key={att.id} style={{ 
                                position: 'relative', 
                                transition: 'transform 0.2s', 
                                cursor: 'pointer' 
                            }} 
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                <img 
                                    src={`data:${att.contentType};base64,${att.data}`} 
                                    alt="evidence" 
                                    style={{
                                        maxWidth: '220px', borderRadius: '12px', 
                                        border: '1px solid var(--border)', 
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                                    }} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', marginTop: '40px' }}>
                        <h3 style={{ margin: '0 0 25px 0', fontSize: '20px', letterSpacing: '-0.5px' }}>Comments & Updates</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                            {comments.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed var(--border)' }}>No comments yet.</p>
                            ) : comments.map(c => (
                                <div key={c.id} style={{ padding: '18px 20px', background: c.user?.id === user.id ? '#f5f5f5' : '#ffffff', borderRadius: '10px', border: '1px solid #dddddd' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <div style={{width: '30px', height: '30px', background: '#1a1a1a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: 'white'}}>
                                                {c.authorId ? 'U' : 'A'} {/* Fallback if full user object isn't returned */}
                                            </div>
                                            <strong>User #{c.authorId}</strong>
                                        </div>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p style={{ margin: '0 0 15px 0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{c.body}</p>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <textarea rows="4" required placeholder="Add a comment or update..." value={newComment} 
                                onChange={e => setNewComment(e.target.value)}
                                className="premium-input"
                                style={{ resize: 'vertical' }} />
                            <button type="submit" style={{ 
                                alignSelf: 'flex-start', padding: '12px 30px', background: '#16a34a', 
                                color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', 
                                fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' 
                            }}>
                                Post Comment
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <ConfirmDialog
            open={deleteCommentDialog.open}
            title="Delete Comment"
            message="Are you sure you want to permanently delete this comment?"
            confirmLabel="Delete"
            danger={true}
            onConfirm={confirmDeleteComment}
            onCancel={() => setDeleteCommentDialog({ open: false, commentId: null })}
        />

        <ConfirmDialog
            open={statusDialog.open}
            title="Change Ticket Status"
            message={`Are you sure you want to change the status to "${statusDialog.newStatus}"?`}
            confirmLabel="Yes, change it"
            danger={false}
            onConfirm={async () => {
                const newStatus = statusDialog.newStatus;
                setStatusDialog({ open: false, newStatus: null });
                try {
                    await api.patch(`/tickets/${ticket.id}/status`, { status: newStatus });
                    fetchData();
                    showNotification(`Ticket successfully marked as ${newStatus}`, 'success');
                } catch (err) { showNotification('Status Update Failed', 'error'); }
            }}
            onCancel={() => setStatusDialog({ open: false, newStatus: null })}
        />
        </>
    );
};

export default TicketDetails;