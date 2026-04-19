import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import LoginSuccess from './pages/LoginSuccess';
import Dashboard from './pages/Dashboard';
import Catalogue from './pages/Catalogue';
import BookResource from './pages/BookResource';
import ManageBookings from './pages/ManageBookings';
import Notifications from './pages/Notifications';
import NotificationSettings from './pages/NotificationSettings';
import Navbar from './components/Navbar';
import RoleRoute from './components/RoleRoute';
import BookingHistory from "./pages/BookingHistory";
import AdminUsers from './pages/AdminUsers';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading profile...</div>;
    
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Router>
                    <Navbar />
                    <div style={{ minHeight: 'calc(100vh - 70px)', paddingBottom: '40px' }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                    <Route path="/login/success" element={<LoginSuccess />} />
                    
                    {/* Secure Route */}
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/catalogue" element={
                        <PrivateRoute>
                            <Catalogue />
                        </PrivateRoute>
                    } />
                    <Route path="/book/:id" element={
                        <PrivateRoute>
                            <BookResource />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/bookings" element={
                        <PrivateRoute>
                            <ManageBookings />
                        </PrivateRoute>
                    } />
                    <Route path="/bookings/history" element={
                        <PrivateRoute>
                            <BookingHistory />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/users" element={
                        <PrivateRoute>
                            <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                                <AdminUsers />
                            </RoleRoute>
                        </PrivateRoute>
                    } />
                    <Route path="/notifications" element={
                        <PrivateRoute>
                            <Notifications />
                        </PrivateRoute>
                    } />
                    <Route path="/notification-settings" element={
                        <PrivateRoute>
                            <NotificationSettings />
                        </PrivateRoute>
                    } />
                    
                        {/* Default Route */}
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </div>
                </Router>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
