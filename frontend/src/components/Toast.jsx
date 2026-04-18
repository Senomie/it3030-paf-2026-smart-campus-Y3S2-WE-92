import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const ToastContainer = () => {
    const { notifications, removeNotification } = useContext(NotificationContext);

    const borderColor = (type) => {
        if (type === 'error')   return '#dc2626';
        if (type === 'warning') return '#d97706';
        return '#1a1a1a';
    };

    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px',
            zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
            {notifications.map(note => (
                <div key={note.id} style={{
                    minWidth: '300px', maxWidth: '380px',
                    background: '#ffffff',
                    border: `1px solid ${borderColor(note.type)}`,
                    borderLeft: `4px solid ${borderColor(note.type)}`,
                    color: '#1a1a1a',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontWeight: 600, fontSize: '14px',
                    animation: 'fadein 0.3s ease',
                }}>
                    <span>{note.message}</span>
                    <button
                        onClick={() => removeNotification(note.id)}
                        style={{
                            background: 'transparent', border: 'none',
                            color: '#aaaaaa', cursor: 'pointer',
                            fontSize: '18px', marginLeft: '16px',
                            lineHeight: 1, padding: '0 4px',
                        }}
                    >&times;</button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
