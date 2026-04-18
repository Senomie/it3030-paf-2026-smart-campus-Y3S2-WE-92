import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/* nav card helpers */
const card = {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '16px 18px', background: '#ffffff',
    border: '1px solid #dddddd', borderRadius: '10px',
    textDecoration: 'none', color: '#1a1a1a', fontWeight: 600,
    fontSize: '14px', transition: 'all 0.15s',
};

const iconBox = (bg) => ({
    width: '38px', height: '38px', borderRadius: '8px',
    background: bg, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '18px', flexShrink: 0,
});

const navItems = [
    { to: '/catalogue',       icon: '🏛️', label: 'Facilities & Assets',  sub: 'Browse and book campus resources',    bg: '#f0f0f0' },
    { to: '/notifications',   icon: '🔔', label: 'Notifications',         sub: 'View alerts and system messages',      bg: '#f5f5f5' },
];
const adminItems = [
    { to: '/admin/bookings',  icon: '📋', label: 'Manage Bookings',       sub: 'Approve or reject requests',           bg: '#f0f0f0' },
    { to: '/admin/users',     icon: '👥', label: 'User Roles',            sub: 'Manage permissions and access',        bg: '#f5f5f5' },
];
const techItem =
    { to: '/technician/desk', icon: '🛠️', label: 'Service Desk',         sub: 'Triage and resolve campus incidents',  bg: '#f0f0f0' };

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const role = user?.role?.replace('ROLE_', '') ?? '';

    const all = [
        ...navItems,
        ...(user?.role === 'ROLE_ADMIN' ? adminItems : []),
        ...(user?.role === 'ROLE_TECHNICIAN' || user?.role === 'ROLE_ADMIN' ? [techItem] : []),
    ];

    return (
        <div style={{ maxWidth: 780, margin: '36px auto', padding: '0 20px' }}>
            {/* Welcome banner */}
            <div style={{
                background: '#1a1a1a', borderRadius: '14px',
                padding: '32px 36px', marginBottom: '28px',
                display: 'flex', alignItems: 'center', gap: '20px',
            }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '14px',
                    background: '#333333', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '28px', flexShrink: 0,
                }}>🏫</div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#eeeeee', fontWeight: 800 }}>
                        Welcome back{user?.name ? `, ${user.name}` : ''}!
                    </h1>
                    <span style={{
                        display: 'inline-block', marginTop: '6px',
                        fontSize: '11px', fontWeight: 700, color: '#aaaaaa',
                        background: '#2a2a2a', padding: '3px 10px',
                        borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.6px',
                    }}>{role}</span>
                </div>
            </div>

            {/* Nav cards grid */}
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                Quick Navigation
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
                {all.map(({ to, icon, label, sub, bg }) => (
                    <Link
                        key={to} to={to} style={card}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#aaaaaa'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#dddddd'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <div style={iconBox(bg)}>{icon}</div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{label}</div>
                            <div style={{ fontSize: '12px', color: '#aaaaaa', fontWeight: 400, marginTop: '2px' }}>{sub}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
