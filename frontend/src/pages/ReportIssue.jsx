import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const ReportIssue = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); 
    const { showNotification } = useContext(NotificationContext);
    const [resource, setResource] = useState(null);
    const [formData, setFormData] = useState({ category: 'IT_EQUIPMENT', priority: 'MEDIUM', description: '', contactDetails: '' });
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        api.get(`/resources/${id}`).then(res => setResource(res.data)).catch(err => console.error(err));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.description.trim() || !formData.contactDetails.trim()) {
            showNotification('Please fill in all required fields properly.', 'error');
            return;
        }
        if (files.length > 3) {
            showNotification('Maximum 3 attachments allowed.', 'error');
            return;
        }

        setIsSubmitting(true);
        let ticketId = null;

        // STEP 1: CREATE THE TICKET FIRST
        try {
            const formattedTitle = `[${formData.category}] Issue with ${resource?.name || `Resource #${id}`}`;
            const formattedDescription = `Priority: ${formData.priority}\nContact: ${formData.contactDetails}\n\nDetails:\n${formData.description}`;

            const res = await api.post('/tickets', {
                title: formattedTitle,
                description: formattedDescription,
                resourceId: Number(id)
            });
            
            ticketId = res.data.id;
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to create ticket.', 'error');
            setIsSubmitting(false);
            return;
        }

        // STEP 2: UPLOAD ATTACHMENTS
        if (files.length > 0 && ticketId) {
            try {
                for (const file of files) {
                    const fd = new FormData();
                    fd.append('file', file); 
                    await api.post(`/tickets/${ticketId}/attachments`, fd);
                }
                showNotification('Incident Ticket and attachments submitted successfully!', 'success');
            } catch (err) {
                console.error("Attachment upload error:", err);
                showNotification('Ticket created, but failed to upload some attachments.', 'error');
            }
        } else {
            showNotification('Incident Ticket submitted successfully!', 'success');
        }
        
        setIsSubmitting(false);
        navigate('/dashboard');
    };

    // Helper function to handle removing a specific image preview
    const removeFile = (indexToRemove, e) => {
        e.preventDefault();
        e.stopPropagation(); // Stops the file browser from opening when clicking the X
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    if (!resource) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <div className="skeleton" style={{ width: '400px', height: '300px', borderRadius: '20px' }} />
        </div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
            <button 
                onClick={() => navigate('/catalogue')}
                disabled={isSubmitting}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
            >
                &larr; Back to Catalogue
            </button>

            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ background: '#1a1a1a', padding: '36px 40px', color: 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', opacity: 0.8 }}>Incident Reporting</div>
                    <h2 style={{ margin: 0, fontSize: '32px', letterSpacing: '-1px' }}>{resource.name}</h2>
                    <p style={{ margin: '15px 0 0 0', opacity: 0.9, fontSize: '14px', lineHeight: '1.5' }}>
                        Help us keep the campus running smoothly by reporting any damages or issues with this resource.
                    </p>
                </div>

                <div style={{ padding: '40px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div className="form-grid">
                            <div>
                                <label className="form-label">Issue Category</label>
                                <select value={formData.category} className="premium-input" 
                                        onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option value="IT_EQUIPMENT">IT / Technology</option>
                                    <option value="FURNITURE">Furniture / Hardware</option>
                                    <option value="PLUMBING">Plumbing / Leaks</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Priority Severity</label>
                                <select value={formData.priority} className="premium-input"
                                        onChange={e => setFormData({...formData, priority: e.target.value})}>
                                    <option value="LOW">Low (Not urgent)</option>
                                    <option value="MEDIUM">Medium (Affects usage)</option>
                                    <option value="HIGH">High (Critical emergency)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Detailed Description</label>
                            <textarea required rows="4" value={formData.description} className="premium-input"
                                      placeholder="Please describe exactly what is broken or malfunctioning..."
                                      onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>

                        <div>
                            <label className="form-label">Preferred Contact Details</label>
                            <input required type="text" value={formData.contactDetails} className="premium-input"
                                   placeholder="e.g. john@university.edu or 0771234567"
                                   onChange={e => setFormData({...formData, contactDetails: e.target.value})} />
                        </div>

                        {/* ⭐ UPDATED IMAGE UPLOAD PREVIEW COMPONENT ⭐ */}
                        <div>
                            <label className="form-label">Evidence Attachments (Optional, max 3)</label>
                            <div style={{ 
                                position: 'relative', border: '2px dashed var(--border)', padding: '25px', 
                                borderRadius: '16px', textAlign: 'center', transition: 'all 0.2s',
                                background: 'rgba(255,255,255,0.02)', minHeight: '120px', 
                                display: 'flex', flexDirection: 'column', justifyContent: 'center'
                            }}>
                                {/* Only show the clickable input file area if we haven't hit the limit */}
                                {files.length < 3 && (
                                    <input type="file" multiple accept="image/*" title="Upload Photos"
                                        onChange={e => {
                                            const newFiles = Array.from(e.target.files);
                                            if (files.length + newFiles.length > 3) {
                                                showNotification('Maximum 3 attachments allowed.', 'error');
                                            } else {
                                                setFiles([...files, ...newFiles].slice(0, 3));
                                            }
                                            e.target.value = ''; // Reset input
                                        }}
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }} 
                                    />
                                )}

                                {files.length > 0 ? (
                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
                                        {files.map((file, idx) => (
                                            <div key={idx} style={{ position: 'relative' }}>
                                                {/* Render the Thumbnail */}
                                                <img src={URL.createObjectURL(file)} alt={`preview-${idx}`} 
                                                     style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '2px solid var(--primary)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                                                />
                                                {/* Red X Button */}
                                                <button type="button" onClick={(e) => removeFile(idx, e)}
                                                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10 }}>
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', pointerEvents: 'none' }}>
                                        <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>📸</span>
                                        Click or drag up to 3 images here
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button type="submit" disabled={isSubmitting} style={{ 
                                flex: 2, padding: '16px', background: isSubmitting ? '#f87171' : '#ef4444', color: 'white', 
                                border: 'none', borderRadius: '14px', cursor: isSubmitting ? 'wait' : 'pointer', fontSize: '16px', 
                                fontWeight: '700', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
                                transition: 'all 0.2s'
                            }}>
                                {isSubmitting ? 'Uploading...' : 'Submit Incident Ticket'}
                            </button>
                            <button type="button" disabled={isSubmitting} onClick={() => navigate('/catalogue')} style={{ 
                                flex: 1, padding: '16px', background: 'var(--surface)', color: 'var(--text-muted)', 
                                border: '1px solid var(--border)', borderRadius: '14px', cursor: 'pointer', fontSize: '16px', 
                                fontWeight: '700' 
                            }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;