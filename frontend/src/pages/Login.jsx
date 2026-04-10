import React from 'react';
import { API_ORIGIN } from '../config/api';

const card = {
    maxWidth: 440,
    margin: '80px auto',
    padding: '40px',
};

const Login = () => {
    const startGoogle = () => {
        window.location.href = `${API_ORIGIN}/oauth2/authorization/google`;
    };

    return (
        <div className="premium-card" style={card}>
            <h1 style={{ marginTop: 0, marginBottom: 8 }}>Smart Campus</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
                Sign in with Google to continue. Ensure <code>GOOGLE_CLIENT_ID</code> and{' '}
                <code>GOOGLE_CLIENT_SECRET</code> are set for the backend.
            </p>
            <button
                type="button"
                onClick={startGoogle}
                style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 15,
                }}
            >
                Continue with Google
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20, marginBottom: 0 }}>
                API: <code style={{ fontSize: 11 }}>{API_ORIGIN}/api</code>
            </p>
        </div>
    );
};

export default Login;
