import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const linkStyle = {
    display: 'block',
    marginBottom: 12,
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: 600,
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="premium-card" style={{ maxWidth: 720, margin: '24px auto', padding: '32px' }}>
            <h1 style={{ marginTop: 0 }}>Welcome{user?.name ? `, ${user.name}` : ''}</h1>
            <p style={{ color: 'var(--text-muted)' }}>
                Role: <strong>{user?.role?.replace('ROLE_', '')}</strong>
            </p>
            <div style={{ marginTop: 28 }}>
                <Link to="/catalogue" style={linkStyle}>Facilities &amp; assets</Link>
                <Link to="/notifications" style={linkStyle}>Notifications</Link>
                {user?.role === 'ROLE_ADMIN' && (
                    <>
                        <Link to="/admin/bookings" style={linkStyle}>Manage bookings</Link>
                        <Link to="/admin/users" style={linkStyle}>User roles (admin)</Link>
                    </>
                )}
                {(user?.role === 'ROLE_TECHNICIAN' || user?.role === 'ROLE_ADMIN') && (
                    <Link to="/technician/desk" style={linkStyle}>Service desk</Link>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
