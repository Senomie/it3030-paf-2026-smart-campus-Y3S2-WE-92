import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const Catalogue = () => {
    const { user } = useContext(AuthContext);
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
                alert('Facility updated successfully!');
            } else {
                await api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                alert('Facility added successfully!');
            }

            setShowAddForm(false);
            setIsEditing(false);
            setNewRes({ name: '', type: 'LECTURE_HALL', capacity: 0, location: '', status: 'ACTIVE', startTime: '08:00', endTime: '18:00' });
            setResImage(null);
            fetchResources();
        } catch(err) { 
            alert('Failed to save resource.'); 
        }
    };

    const handleEditClick = (res) => {
        setIsEditing(true);
        setEditId(res.id);
        setNewRes({ name: res.name, type: res.type, capacity: res.capacity, location: res.location, status: res.status, startTime: res.startTime || '08:00', endTime: res.endTime || '18:00' });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (id) => {
        if(window.confirm("Delete this facility? This cannot be undone.")) {
            try {
                await api.delete(`/resources/${id}`);
                fetchResources();
            } catch(e) { 
                alert("Failed to delete resource"); 
            }
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
                marginBottom: '30px', 
                padding: '20px', 
                background: 'var(--surface)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
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
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    {['grid', 'list'].map(mode => (
                        <button 
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            style={{ 
                                padding: '8px 16px', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontSize: '12px', 
                                fontWeight: '700',
                                textTransform: 'capitalize',
                                background: viewMode === mode ? 'var(--primary)' : 'transparent',
                                color: viewMode === mode ? 'white' : 'var(--text-muted)',
                                transition: 'all 0.2s'
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
                        padding: '10px 20px', 
                        background: 'var(--primary)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '10px', 
                        cursor: 'pointer', 
                        fontWeight: '700', 
                        fontSize: '13px',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.2s'
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

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button type="submit" style={{ flex: 2, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                                {isEditing ? 'Update' : 'Create'} Facility
                            </button>
                            <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '12px', background: 'var(--surface-light)', color: 'var(--text-muted)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${viewMode === 'list' ? '100%' : '280px'}, 1fr))`, gap: '20px' }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="premium-card" style={{ padding: '20px', display: 'flex', gap: '15px' }}>
                            <div className="skeleton" style={{ flex: '0 0 140px', height: '140px', borderRadius: '10px' }}></div>
                            <div style={{ flex: 1 }}>
                                <div className="skeleton" style={{ width: '70%', height: '20px', marginBottom: '12px' }}></div>
                                <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px' }}></div>
                                <div className="skeleton" style={{ width: '85%', height: '16px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
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
                                                <button onClick={() => window.location.href=`/book/${res.id}`} style={{ flex: 1, padding: '8px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Book</button>
                                                <button onClick={() => window.location.href=`/report/${res.id}`} style={{ flex: 1, padding: '8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Report</button>
                                            </>
                                        )}
                                        {user?.role === 'ROLE_ADMIN' && (
                                            <>
                                                <button onClick={() => handleEditClick(res)} style={{ flex: 1, padding: '8px', background: 'var(--warning)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Edit</button>
                                                <button onClick={() => handleDeleteClick(res.id)} style={{ flex: 1, padding: '8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Delete</button>
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
        </div>
    );
};

export default Catalogue;
