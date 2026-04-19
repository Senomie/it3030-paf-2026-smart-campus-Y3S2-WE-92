import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const prevCountRef = React.useRef(0);

    const playPing = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play();
        } catch (e) { console.error("Sound failed", e); }
    };

    useEffect(() => {
        if (!user) return;
        const fetchNotifs = () => {
            api.get(`/notifications/user/${user.id}`).then(res => {
                const unread = res.data.filter(n => !n.read).length;
                if (unread > prevCountRef.current && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_TECHNICIAN')) {
                    playPing();
                }
                setUnreadCount(unread);
                prevCountRef.current = unread;
            }).catch(() => {});
        };
        fetchNotifs();
        const intv = setInterval(fetchNotifs, 10000);
        return () => clearInterval(intv);
    }, [user, location.pathname]);

    if (!user || location.pathname === '/login' || location.pathname.startsWith('/oauth2')) {
        return null;
    }

    const isActive = (path) => location.pathname === path;

    const navStyle = {
        background: 'rgba(255, 255, 255, 0.85)',       // white instead of dark
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '12px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.07)',       // subtle light border
        position: 'sticky',
        top: '15px',
        margin: '0 20px 20px 20px',
        borderRadius: '24px',
        zIndex: 1000,
        maxWidth: 'calc(100% - 40px)',
    };

    const linkStyle = (path) => {
        const active = isActive(path);
        return {
            textDecoration: 'none',
            color: active ? '#1a1a1a' : '#888888',      // dark active, grey inactive
            fontWeight: active ? 700 : 500,
            marginRight: '4px',
            fontSize: '14px',
            transition: 'all 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 14px',
            borderRadius: '10px',
            background: active ? '#f0f0f0' : 'transparent',   // light grey pill for active
            boxShadow: 'none',
        };
    };

    return (
        <nav style={navStyle}>
            {/* Left — logo + links */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                    onClick={() => navigate('/dashboard')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        marginRight: '24px', cursor: 'pointer', userSelect: 'none',
                    }}
                >
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '9px',
                        background: '#1a1a1a', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '18px',
                    }}>🏫</div>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                        SmartCampus
                    </span>
                </div>

                <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
                <Link to="/catalogue" style={linkStyle('/catalogue')}>Facilities & Assets</Link>

                {user.role === 'ROLE_USER' && (
                    <Link to="/bookings/history" style={linkStyle('/bookings/history')}>My Bookings</Link>
                )}
                {user.role === 'ROLE_ADMIN' && (
                    <>
                        <Link to="/admin/bookings" style={linkStyle('/admin/bookings')}>Bookings</Link>
                        <Link to="/admin/users" style={linkStyle('/admin/users')}>Users</Link>
                    </>
                )}
                {(user.role === 'ROLE_TECHNICIAN' || user.role === 'ROLE_ADMIN') && (
                    <Link to="/technician/desk" style={linkStyle('/technician/desk')}>Service Desk</Link>
                )}
            </div>

            {/* Right — bell + user + sign out */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Bell */}
                <Link
                    to="/notifications"
                    style={{
                        position: 'relative', display: 'inline-flex', alignItems: 'center',
                        justifyContent: 'center', width: '38px', height: '38px',
                        borderRadius: '10px', fontSize: '18px', textDecoration: 'none',
                        background: unreadCount > 0 ? '#f5f5f5' : 'transparent',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                    onMouseLeave={e => e.currentTarget.style.background = unreadCount > 0 ? '#f5f5f5' : 'transparent'}
                >
                    🔔
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '4px', right: '4px',
                            background: '#dc2626', color: 'white',
                            fontSize: '9px', fontWeight: 800,
                            padding: '1px 4px', borderRadius: '8px', lineHeight: 1.4,
                        }}>{unreadCount}</span>
                    )}
                </Link>

                {/* Divider */}
                <div style={{ width: '1px', height: '24px', background: '#dddddd', margin: '0 4px' }} />

                {/* User chip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: '#1a1a1a', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px',
                    }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ lineHeight: 1.3 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>{user.name}</div>
                        <div style={{ fontSize: '10px', color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {user.role.replace('ROLE_', '')}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ width: '1px', height: '24px', background: '#dddddd', margin: '0 4px' }} />

                {/* Sign out */}
                <button
                    onClick={logout}
                    style={{
                        padding: '7px 16px', background: 'transparent',
                        border: '1.5px solid #cccccc', borderRadius: '10px',
                        cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                        color: '#555555', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#1a1a1a'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555555'; e.currentTarget.style.borderColor = '#cccccc'; }}
                >
                    Sign Out
                </button>
            </div>
        </nav>
    );
};

export default Navbar;