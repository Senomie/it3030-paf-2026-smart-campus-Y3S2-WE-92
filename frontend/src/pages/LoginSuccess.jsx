import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [message, setMessage] = useState('Completing sign-in…');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setMessage('Missing token. Try signing in again.');
            setTimeout(() => navigate('/login', { replace: true }), 1500);
            return;
        }
        (async () => {
            const ok = await login(token);
            navigate(ok ? '/dashboard' : '/login', { replace: true });
        })();
    }, [searchParams, navigate, login]);

    return (
        <div style={{ textAlign: 'center', marginTop: '80px', color: 'var(--text-muted)' }}>
            {message}
        </div>
    );
};

export default LoginSuccess;
