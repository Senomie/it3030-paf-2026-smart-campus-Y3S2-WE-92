import React, { useState, useEffect } from 'react';

/**
 * PromptDialog — custom in-app replacement for window.prompt().
 *
 * Props:
 *   open         {boolean}  – whether the dialog is visible
 *   title        {string}   – bold heading text
 *   message      {string}   – body / instruction text
 *   placeholder  {string}   – textarea placeholder
 *   confirmLabel {string}   – label for the confirm button (default "Submit")
 *   cancelLabel  {string}   – label for the cancel button (default "Cancel")
 *   required     {boolean}  – if true, disables submit when input is empty
 *   onConfirm    {fn(value)}– called with the entered string on confirm
 *   onCancel     {fn}       – called when user cancels or clicks the backdrop
 */
const PromptDialog = ({
    open,
    title = 'Enter details',
    message,
    placeholder = 'Type here...',
    confirmLabel = 'Submit',
    cancelLabel = 'Cancel',
    required = false,
    onConfirm,
    onCancel,
}) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        if (open) setValue('');
    }, [open]);

    if (!open) return null;

    const handleConfirm = () => {
        if (required && !value.trim()) return;
        onConfirm(value.trim());
    };

    const isEmpty = required && !value.trim();

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
                    maxWidth: '460px',
                    width: '100%',
                    animation: 'fadein 0.2s ease',
                }}
            >
                <h3 style={{ margin: '0 0 10px', fontSize: '18px', color: '#1a1a1a', fontWeight: 700 }}>
                    {title}
                </h3>
                {message && (
                    <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#555555', lineHeight: 1.6 }}>
                        {message}
                    </p>
                )}
                <textarea
                    autoFocus
                    rows={4}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '11px 14px',
                        border: '1.5px solid #cccccc',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#1a1a1a',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        marginBottom: '24px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#888888'}
                    onBlur={e => e.target.style.borderColor = '#cccccc'}
                />
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
                        onClick={handleConfirm}
                        disabled={isEmpty}
                        style={{
                            padding: '10px 22px', border: 'none',
                            borderRadius: '8px',
                            background: isEmpty ? '#aaaaaa' : '#16a34a',
                            color: '#ffffff', fontWeight: 700, fontSize: '14px',
                            cursor: isEmpty ? 'not-allowed' : 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseOver={e => { if (!isEmpty) e.currentTarget.style.background = '#15803d'; }}
                        onMouseOut={e => { if (!isEmpty) e.currentTarget.style.background = '#16a34a'; }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromptDialog;
