import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * @param {React.ReactNode} children
 * @param {string[]} allowedRoles e.g. ['ROLE_ADMIN', 'ROLE_TECHNICIAN']
 */
const RoleRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</div>;
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

export default RoleRoute;
