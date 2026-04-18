import React, { useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const NotificationSettings = () => {
    const { user } = useContext(AuthContext);
    const { success: showSuccess, error: showError } = useContext(NotificationContext);
    const [preferences, setPreferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        
        const fetchPreferences = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/notifications/preferences/${user.id}`);
                setPreferences(res.data || []);
            } catch (err) {
                showError(err.response?.data?.error || 'Failed to load notification preferences', 5000);
                console.error('Error fetching preferences:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [user?.id, showError]);

    const togglePreference = async (type, currentValue) => {
        try {
            setSaving(true);
            await api.put(`/notifications/preferences/${user.id}`, {
                type,
                enabled: !currentValue
            });

            // Update local state
            setPreferences(prefs =>
                prefs.map(p =>
                    p.type === type ? { ...p, enabled: !currentValue } : p
                )
            );

            showSuccess(`Preference updated for ${formatType(type)}`);
        } catch (err) {
            showError(err.response?.data?.error || 'Failed to update preference', 5000);
        } finally {
            setSaving(false);
        }
    };

    const formatType = (type) => {
        return type
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: 48, padding: '0 20px' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading notification settings...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 720, margin: '24px auto', padding: '0 20px' }}>
            <h1 style={{ marginTop: 0, marginBottom: 8 }}>Notification Preferences</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
                Manage which types of notifications you want to receive about your bookings and tickets.
            </p>

            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {preferences.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No notification preferences found
                    </div>
                ) : (
                    preferences.map((pref, idx) => (
                        <div
                            key={pref.type}
                            style={{
                                padding: 20,
                                borderBottom: idx < preferences.length - 1 ? '1px solid var(--border)' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 16
                            }}
                        >
                            <div>
                                <div style={{
                                    fontWeight: 600,
                                    marginBottom: 4,
                                    color: 'var(--text-main)'
                                }}>
                                    {formatType(pref.type)}
                                </div>
                                <div style={{
                                    fontSize: 13,
                                    color: 'var(--text-muted)'
                                }}>
                                    {getNotificationDescription(pref.type)}
                                </div>
                            </div>

                            <button
                                onClick={() => togglePreference(pref.type, pref.enabled)}
                                disabled={saving}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: pref.enabled
                                        ? 'rgba(34, 197, 94, 0.15)'
                                        : 'rgba(107, 114, 128, 0.15)',
                                    color: pref.enabled ? '#22c55e' : '#6b7280',
                                    fontWeight: 600,
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: saving ? 0.6 : 1,
                                    minWidth: 80,
                                    textAlign: 'center'
                                }}
                                onMouseOver={(e) => {
                                    if (!saving) {
                                        e.target.style.transform = 'scale(1.05)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                {pref.enabled ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div style={{
                marginTop: 28, padding: 16,
                background: '#f5f5f5',
                border: '1px solid #dddddd',
                borderRadius: 10,
                color: '#444444',
                fontSize: 13, lineHeight: 1.6
            }}>
                <strong>ℹ️ About these notifications:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                    <li><strong>Booking Approved:</strong> When your facility booking request is approved</li>
                    <li><strong>Booking Rejected:</strong> When your facility booking request is rejected</li>
                    <li><strong>Ticket Status:</strong> When your maintenance ticket status changes</li>
                    <li><strong>Ticket Comment:</strong> When someone comments on your ticket</li>
                </ul>
            </div>
        </div>
    );
};

const getNotificationDescription = (type) => {
    const descriptions = {
        'BOOKING_APPROVED': 'Receive alerts when bookings are approved',
        'BOOKING_REJECTED': 'Receive alerts when bookings are rejected',
        'TICKET_STATUS': 'Receive alerts when ticket status changes',
        'TICKET_COMMENT': 'Receive alerts when someone comments on your tickets'
    };
    return descriptions[type] || 'Notification type';
};

export default NotificationSettings;
