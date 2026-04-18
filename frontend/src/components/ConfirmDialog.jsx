import React from 'react';

/**
 * ConfirmDialog — custom in-app replacement for window.confirm().
 *
 * Props:
 *   open        {boolean}  – whether the dialog is visible
 *   title       {string}   – bold heading text
 *   message     {string}   – body text
 *   confirmLabel{string}   – label for the confirm button (default "Confirm")
 *   cancelLabel {string}   – label for the cancel button (default "Cancel")
 *   danger      {boolean}  – if true the confirm button is red, else green
 *   onConfirm   {fn}       – called when user clicks confirm
 *   onCancel    {fn}       – called when user clicks cancel or the backdrop
 */
const ConfirmDialog = ({
    open,
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    const confirmBg = danger ? '#dc2626' : '#16a34a';
    const confirmHover = danger ? '#b91c1c' : '#15803d';

    return (
        <div
            onClick={onCancel}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                zIndex: 99999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
                animation: 'fadein 0.18s ease',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    padding: '32px 36px',
                    maxWidth: '420px',
                    width: '100%',
                    animation: 'fadein 0.2s ease',
                }}
            >
                <h3 style={{ margin: '0 0 10px', fontSize: '18px', color: '#1a1a1a', fontWeight: 700 }}>
                    {title}
                </h3>
                {message && (
                    <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#555555', lineHeight: 1.6 }}>
                        {message}
                    </p>
                )}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 22px', border: '1.5px solid #cccccc',
                            borderRadius: '8px', background: '#ffffff',
                            color: '#555555', fontWeight: 700, fontSize: '14px',
                            cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#f0f0f0'}
                        onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 22px', border: 'none',
                            borderRadius: '8px', background: confirmBg,
                            color: '#ffffff', fontWeight: 700, fontSize: '14px',
                            cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = confirmHover}
                        onMouseOut={e => e.currentTarget.style.background = confirmBg}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
