import React, { useContext, useState } from 'react';
import api from '../api/axiosConfig';
import { NotificationContext } from '../context/NotificationContext';

const AdminUsers = () => {
    const { showNotification } = useContext(NotificationContext);
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('USER');

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${userId}/role`, { role });
            showNotification(`User ${userId} is now ${role}.`, 'success');
        } catch (err) {
            showNotification(err.response?.data?.error || err.message, 'error');
        }
    };

    return (
        <div className="premium-card" style={{ maxWidth: 520, margin: '24px auto', padding: 28 }}>
            <h1 style={{ marginTop: 0 }}>User roles</h1>
            <p style={{ color: 'var(--text-muted)' }}>
                Admin only. Role values: <code>USER</code>, <code>ADMIN</code>, <code>TECHNICIAN</code>.
            </p>
            <form onSubmit={submit}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>User id</label>
                <input
                    required
                    type="number"
                    min={1}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    style={{ width: '100%', borderRadius: 10, padding: 12, marginBottom: 16, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                />
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%', borderRadius: 10, padding: 12, marginBottom: 20, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                >
                    <option value="USER">USER</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
                <button
                    type="submit"
                    style={{
                        padding: '12px 20px',
                        borderRadius: 12,
                        border: 'none',
                        background: 'var(--primary)',
                        color: 'white',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    Update role
                </button>
            </form>
        </div>
    );
};

export default AdminUsers;
