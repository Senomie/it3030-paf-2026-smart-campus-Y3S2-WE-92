import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import ConfirmDialog from '../components/ConfirmDialog';

const Catalogue = () => {
    const { user } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [resources, setResources] = useState([]);
    const [typeFilter, setTypeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [newRes, setNewRes] = useState({ name: '', type: 'LECTURE_HALL', capacity: 0, location: '', status: 'ACTIVE', startTime: '08:00', endTime: '18:00' });
    const [resImage, setResImage] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, resourceId: null });

    const fetchResources = async () => {
        try {
            setLoading(true);
            const endpoint = typeFilter ? `/resources?type=${typeFilter}` : '/resources';
            const response = await api.get(endpoint);
            setTimeout(() => {
                setResources(response.data);
                setLoading(false);
            }, 1500);
        } catch (error) {
            console.error("Failed to fetch resources", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [typeFilter]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newRes.name);
            formData.append('type', newRes.type);
            formData.append('capacity', newRes.capacity);
            formData.append('location', newRes.location);
            formData.append('status', newRes.status);
            formData.append('startTime', newRes.startTime);
            formData.append('endTime', newRes.endTime);
            if (resImage) formData.append('image', resImage);

            if (isEditing) {
                await api.put(`/resources/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                showNotification('Facility updated successfully!', 'success');
            } else {
                await api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                showNotification('Facility added successfully!', 'success');
            }

            setShowAddForm(false);
            setIsEditing(false);
            setNewRes({ name: '', type: 'LECTURE_HALL', capacity: 0, location: '', status: 'ACTIVE', startTime: '08:00', endTime: '18:00' });
            setResImage(null);
            fetchResources();
        } catch(err) { 
            showNotification('Failed to save resource.', 'error'); 
        }
    };

    const handleEditClick = (res) => {
        setIsEditing(true);
        setEditId(res.id);
        setNewRes({ name: res.name, type: res.type, capacity: res.capacity, location: res.location, status: res.status, startTime: res.startTime || '08:00', endTime: res.endTime || '18:00' });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id) => {
        setConfirmDialog({ open: true, resourceId: id });
    };

    const handleDeleteConfirm = async () => {
        const id = confirmDialog.resourceId;
        setConfirmDialog({ open: false, resourceId: null });
        try {
            await api.delete(`/resources/${id}`);
            fetchResources();
        } catch(e) { 
            showNotification('Failed to delete resource.', 'error'); 
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'ACTIVE': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', text: 'Available' };
            case 'MAINTENANCE': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', text: 'Maintenance' };
            case 'INACTIVE': return { bg: 'rgba(148, 163, 184, 0.1)', color: '#94A3B8', text: 'Inactive' };
            default: return { bg: 'rgba(94, 234, 212, 0.1)', color: '#6366f1', text: status };
        }
    };

    // Beautiful Loading Screen Component
    const LoadingScreen = () => (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '600px',
            background: '#f5f5f5',
            borderRadius: '12px',
            padding: '40px 20px'
        }}>
            <div style={{ textAlign: 'center' }}>
                {/* Animated Gradient Circle */}
                <div style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    margin: '0 auto 30px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {/* Outer rotating ring */}
                    <div style={{
                        position: 'absolute',
                        width: '120px', height: '120px',
                        borderRadius: '50%',
                        border: '3px solid #eeeeee',
                        borderTop: '3px solid #1a1a1a',
                        animation: 'spin 1.5s linear infinite'
                    }}></div>

                    {/* Middle rotating ring (opposite direction) */}
                    <div style={{
                        position: 'absolute',
                        width: '90px', height: '90px',
                        borderRadius: '50%',
                        border: '3px solid #eeeeee',
                        borderBottom: '3px solid #555555',
                        animation: 'spin-reverse 2s linear infinite'
                    }}></div>

                    {/* Center dot */}
                    <div style={{
                        width: '16px', height: '16px',
                        borderRadius: '50%',
                        background: '#1a1a1a',
                    }}></div>
                </div>

                {/* Animated Text */}
                <h3 style={{
                    margin: '0 0 10px',
                    fontSize: '20px',
                    color: 'var(--text-main)',
                    fontWeight: '700',
                    letterSpacing: '0.5px'
                }}>
                    Loading Facilities
                    <span style={{
                        display: 'inline-block',
                        marginLeft: '4px',
                        animation: 'bounce 1.4s infinite'
                    }}>.</span>
                    <span style={{
                        display: 'inline-block',
                        marginLeft: '4px',
                        animation: 'bounce 1.4s infinite 0.2s'
                    }}>.</span>
                    <span style={{
                        display: 'inline-block',
                        marginLeft: '4px',
                        animation: 'bounce 1.4s infinite 0.4s'
                    }}>.</span>
                </h3>

                {/* Subtext */}
                <p style={{
                    margin: '15px 0 0',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    fontWeight: '500'
                }}>
                    Fetching available resources...
                </p>

                {/* Loading bars */}
                <div style={{ marginTop: '25px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} style={{
                            width: '6px', height: '32px', borderRadius: '3px',
                            background: '#cccccc',
                            animation: `pulse-height 1.6s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`
                        }}></div>
                    ))}
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 1; }
                    30% { transform: translateY(-10px); opacity: 0.7; }
                }
                
                @keyframes pulse-height {
                    0%, 100% { height: 10px; opacity: 0.5; }
                    50% { height: 40px; opacity: 1; }
                }
            `}</style>
        </div>
    );

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', color: 'var(--text-main)', margin: '0 0 8px', fontWeight: '800' }}>
                    Facilities & Assets
                </h1>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '16px' }}>
                    Browse, book, and manage university resources efficiently.
                </p>
            </div>
            
            {/* Filter & Controls */}
            <div style={{ 
                marginBottom: '24px', 
                padding: '16px 20px', 
                background: '#ffffff',
                border: '1px solid #dddddd',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap'
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search facilities..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="premium-input"
                        style={{ paddingLeft: '35px' }}
                    />
                </div>

                {/* Filter */}
                <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="premium-input"
                    style={{ width: '180px' }}
                >
                    <option value="">All Categories</option>
                    <option value="LECTURE_HALL">Lecture Halls</option>
                    <option value="LAB">Labs</option>
                    <option value="MEETING_ROOM">Meeting Rooms</option>
                    <option value="EQUIPMENT">Equipment</option>
                </select>

                {/* View Toggle */}
                <div style={{ display: 'flex', background: '#f0f0f0', padding: '3px', borderRadius: '8px', border: '1px solid #dddddd' }}>
                    {['grid', 'list'].map(mode => (
                        <button 
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            style={{ 
                                padding: '7px 14px', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer', 
                                fontSize: '12px', 
                                fontWeight: '700',
                                textTransform: 'capitalize',
                                background: viewMode === mode ? '#1a1a1a' : 'transparent',
                                color: viewMode === mode ? '#ffffff' : '#888888',
                                transition: 'all 0.15s'
                            }}
                        >
                            {mode === 'grid' ? '◊' : '≡'} {mode}
                        </button>
                    ))}
                </div>

                {/* Admin Add Button */}
                {user?.role === 'ROLE_ADMIN' && (
                    <button onClick={() => {
                        setShowAddForm(!showAddForm);
                        if(showAddForm) { 
                            setIsEditing(false); 
                            setNewRes({ name: '', type: 'LECTURE_HALL', capacity: 0, location: '', status: 'ACTIVE', startTime: '08:00', endTime: '18:00' }); 
                        }
                    }} style={{ 
                        padding: '9px 18px', 
                        background: '#16a34a', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontWeight: '700', 
                        fontSize: '13px',
                        transition: 'all 0.15s'
                    }}>
                        + Add Facility
                    </button>
                )}
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="premium-card" style={{ padding: '30px', marginBottom: '40px' }}>
                    <div style={{ marginBottom: '25px' }}>
                        <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)' }}>
                            {isEditing ? '✏️ Edit Resource' : '✨ Create New Resource'}
                        </h2>
                    </div>

                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div className="form-grid">
                            <div>
                                <label className="form-label">Facility Name</label>
                                <input required placeholder="e.g. Lecture Hall A-101" value={newRes.name} className="premium-input" onChange={e => setNewRes({...newRes, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">Category</label>
                                <select value={newRes.type} className="premium-input" onChange={e => setNewRes({...newRes, type: e.target.value})}>
                                    <option value="LECTURE_HALL">Lecture Hall</option>
                                    <option value="LAB">Laboratory</option>
                                    <option value="MEETING_ROOM">Meeting Room</option>
                                    <option value="EQUIPMENT">Equipment</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Location</label>
                                <input required placeholder="Building & Floor" value={newRes.location} className="premium-input" onChange={e => setNewRes({...newRes, location: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">Capacity</label>
                                <input required type="number" value={newRes.capacity} className="premium-input" onChange={e => setNewRes({...newRes, capacity: parseInt(e.target.value) || 0})} />
                            </div>
                        </div>

                        <div className="form-grid">
                            <div>
                                <label className="form-label">Status</label>
                                <select value={newRes.status} className="premium-input" onChange={e => setNewRes({...newRes, status: e.target.value})}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Opens At</label>
                                <input required type="time" value={newRes.startTime} className="premium-input" onChange={e => setNewRes({...newRes, startTime: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">Closes At</label>
                                <input required type="time" value={newRes.endTime} className="premium-input" onChange={e => setNewRes({...newRes, endTime: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">Featured Image</label>
                                <input type="file" accept="image/*" className="premium-input" onChange={e => setResImage(e.target.files[0])} style={{ padding: '8px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" style={{ flex: 2, padding: '11px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
                                {isEditing ? 'Update' : 'Create'} Facility
                            </button>
                            <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '11px', background: '#ffffff', color: '#555555', border: '1.5px solid #cccccc', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* LOADING SCREEN - Use the new LoadingScreen component */}
            {loading ? (
                <LoadingScreen />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${viewMode === 'list' ? '100%' : '280px'}, 1fr))`, gap: '20px' }}>
                    {resources.filter(res => {
                        const matchesType = !typeFilter || res.type === typeFilter;
                        const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            res.location.toLowerCase().includes(searchQuery.toLowerCase());
                        return matchesType && matchesSearch;
                    }).map(res => {
                        const status = getStatusColor(res.status);
                        return (
                            <div key={res.id} className="premium-card" style={{ 
                                padding: '16px', 
                                display: viewMode === 'list' ? 'flex' : 'flex',
                                flexDirection: viewMode === 'list' ? 'row' : 'column',
                                gap: '15px',
                                alignItems: 'stretch'
                            }}>
                                {/* Image */}
                                {res.image && (
                                    <div style={{ 
                                        flex: viewMode === 'list' ? '0 0 160px' : '0 0 100%',
                                        height: viewMode === 'list' ? '160px' : '180px',
                                        overflow: 'hidden', 
                                        borderRadius: '10px', 
                                        background: 'var(--surface-light)',
                                        position: 'relative'
                                    }}>
                                        <img src={`data:${res.imageContentType};base64,${res.image}`} alt={res.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="zoom-hover" />
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: status.bg, color: status.color, padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', border: `1px solid ${status.color}80` }}>
                                            {status.text}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Content */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--text-main)' }}>{res.name}</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                            <span>📁 {res.type.replace('_', ' ')}</span>
                                            <span>👥 {res.capacity} pax</span>
                                            <span>📍 {res.location}</span>
                                            <span>🕐 {res.startTime || '08:00'}-{res.endTime || '18:00'}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                                        {user?.role === 'ROLE_USER' && res.status === 'ACTIVE' && (
                                            <>
                                                <button onClick={() => window.location.href=`/book/${res.id}`} style={{ flex: 1, padding: '7px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Book</button>
                                                <button onClick={() => window.location.href=`/report/${res.id}`} style={{ flex: 1, padding: '7px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Report</button>
                                            </>
                                        )}
                                        {user?.role === 'ROLE_ADMIN' && (
                                            <>
                                                <button onClick={() => handleEditClick(res)} style={{ flex: 1, padding: '7px', background: '#555555', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Edit</button>
                                                <button onClick={() => handleDeleteClick(res.id)} style={{ flex: 1, padding: '7px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Delete</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {!loading && resources.length === 0 && <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>📭 No facilities found</div>}

            <ConfirmDialog
                open={confirmDialog.open}
                title="Delete Facility"
                message="Are you sure you want to delete this facility? This action cannot be undone."
                confirmLabel="Delete"
                danger={true}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmDialog({ open: false, resourceId: null })}
            />
        </div>
    );
};

export default Catalogue;
