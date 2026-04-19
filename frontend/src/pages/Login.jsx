import React from 'react';
import { API_ORIGIN } from '../config/api';

const Login = () => {
    const startGoogle = () => {
        window.location.href = `${API_ORIGIN}/oauth2/authorization/google`;
    };

    return (
        <div style={{
            display: 'flex', minHeight: '100vh',
            background: '#eeeeee', fontFamily: "'Outfit', sans-serif",
        }}>
            {/* ─── Left: Branding Panel ─── */}
            <div style={{
                flex: '0 0 44%', background: '#1a1a1a',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: '60px 56px',
            }}>
                <div style={{
                    width: '52px', height: '52px', borderRadius: '12px',
                    background: '#333333', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '28px', marginBottom: '32px',
                }}>🏫</div>

                <h1 style={{
                    margin: '0 0 16px', fontSize: '38px', fontWeight: 800,
                    color: '#eeeeee', letterSpacing: '-1.5px', lineHeight: 1.1,
                }}>
                    Smart<br />Campus
                </h1>

                <p style={{
                    margin: '0 0 48px', fontSize: '15px', color: '#888888', lineHeight: 1.7,
                }}>
                    Manage facilities, incidents, and service desk requests — all in one place.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                        { icon: '🏛️', text: 'Book lecture halls & labs' },
                        { icon: '🛠️', text: 'Report campus issues' },
                        { icon: '📋', text: 'Track service desk tickets' },
                    ].map(({ icon, text }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '8px',
                                background: '#2a2a2a', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                            }}>{icon}</div>
                            <span style={{ color: '#bbbbbb', fontSize: '14px', fontWeight: 500 }}>{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Right: Sign-in Panel ─── */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '40px',
            }}>
                <div style={{
                    width: '100%', maxWidth: '380px',
                    background: '#ffffff', borderRadius: '16px',
                    border: '1px solid #dddddd',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    padding: '40px',
                }}>
                    <p style={{
                        margin: '0 0 6px', fontSize: '12px', fontWeight: 700,
                        color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '1px',
                    }}>Welcome back</p>
                    <h2 style={{ margin: '0 0 28px', fontSize: '26px', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                        Sign in to continue
                    </h2>

                    <button
                        type="button"
                        onClick={startGoogle}
                        style={{
                            width: '100%', padding: '13px 18px',
                            borderRadius: '10px', border: '1.5px solid #dddddd',
                            background: '#1a1a1a', color: '#ffffff',
                            fontWeight: 700, cursor: 'pointer',
                            fontSize: '14px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: '10px',
                            transition: 'all 0.15s', letterSpacing: '0.2px',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#333333'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; }}
                    >
                        <span style={{ fontSize: '18px' }}>G</span>
                        Continue with Google
                    </button>

                    <p style={{ fontSize: '11px', color: '#bbbbbb', marginTop: '20px', marginBottom: 0, textAlign: 'center' }}>
                        API: <code style={{ fontSize: '10px', color: '#aaaaaa' }}>{API_ORIGIN}/api</code>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
