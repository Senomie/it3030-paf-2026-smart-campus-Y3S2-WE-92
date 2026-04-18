import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const BookResource = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);

    const [resourceName, setResourceName] = useState('');
    const [purpose, setPurpose] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [repeatUntil, setRepeatUntil] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [recurrence, setRecurrence] = useState('SINGLE');
    const [fullName, setFullName] = useState(user?.name || user?.fullName || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [timeError, setTimeError] = useState('');

    const nowLocal = () => {
        const now = new Date();
        now.setSeconds(0, 0);
        return now.toISOString().slice(0, 16);
    };
    const minDateTime = nowLocal();
    const minDateOnly = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        const fetchResource = async () => {
            try {
                const res = await api.get(`/resources/${id}`);
                setResourceName(res.data.name);
            } catch {
                setResourceName(id);
            }
        };
        if (id) fetchResource();
    }, [id]);

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            setPhoneNumber(value);
            setPhoneError(value.length > 0 && value.length < 10 ? 'Must be exactly 10 digits' : '');
        }
    };

    const handleStartChange = (e) => {
        const val = e.target.value;
        setStartTime(val);
        setTimeError('');
        if (val) {
            const start = new Date(val);
            start.setHours(start.getHours() + 1);
            setEndTime(start.toISOString().slice(0, 16));
        }
    };

    const handleEndChange = (e) => {
        const val = e.target.value;
        setEndTime(val);
        if (startTime && val && new Date(val) <= new Date(startTime)) {
            setTimeError('End time must be after start time');
        } else {
            setTimeError('');
        }
    };

    const getDuration = () => {
        if (!startTime || !endTime) return null;
        const diff = new Date(endTime) - new Date(startTime);
        if (diff <= 0) return null;
        const totalMins = Math.floor(diff / 60000);
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        if (hrs === 0) return `${mins} min`;
        if (mins === 0) return `${hrs} hr`;
        return `${hrs} hr ${mins} min`;
    };

    const submit = async (e) => {
        e.preventDefault();
        if (phoneNumber.length !== 10) { setPhoneError('Must be exactly 10 digits'); return; }
        if (startTime && endTime && new Date(endTime) <= new Date(startTime)) { setTimeError('End time must be after start time'); return; }
        setSubmitting(true);
        try {
            await api.post('/bookings', {
                resourceLabel: resourceName || id,
                purpose,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                recurrence,
                repeatUntil: repeatUntil ? new Date(repeatUntil).toISOString() : null,
                fullName,
                phoneNumber,
            });
            showNotification('Booking request submitted (PENDING).', 'success');
            navigate('/dashboard');
        } catch (err) {
            showNotification(err.response?.data?.error || err.message || 'Booking failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const duration = getDuration();

    // ── Shared style tokens ──
    const field = {
        width: '100%',
        padding: '11px 14px',
        borderRadius: 10,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--text-main)',
        fontSize: 14,
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.15s',
    };
    const fieldError = { ...field, border: '1px solid #f87171' };
    const label = {
        display: 'block',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text-muted)',
        marginBottom: 6,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
    };
    const required = { color: '#f87171', marginLeft: 3 };
    const hint = { fontSize: 12, color: 'var(--text-muted)', marginTop: 4 };
    const errorText = { fontSize: 12, color: '#f87171', marginTop: 4 };
    const fieldGroup = { marginBottom: 20 };
    const divider = {
        border: 'none',
        borderTop: '1px solid var(--border)',
        margin: '24px 0',
    };

    return (
        <div style={{ maxWidth: 560, margin: '32px auto', padding: '0 16px' }}>
            <div className="premium-card" style={{ padding: '32px 36px' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.25)',
                        borderRadius: 20, padding: '4px 12px', marginBottom: 14,
                    }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                            {resourceName || '…'}
                        </span>
                    </div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>Book Resource</h1>
                    <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
                        Fill in the details below to submit a booking request.
                    </p>
                </div>

                <form onSubmit={submit}>

                    {/* ── Section: Personal Info ── */}
                    <div style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: 'var(--text-muted)',
                        marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <span>Personal Info</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    {/* Full Name */}
                    <div style={fieldGroup}>
                        <label style={label}>Full Name <span style={required}>*</span></label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Kavindu Perera"
                            style={field}
                        />
                    </div>

                    {/* Phone Number */}
                    <div style={fieldGroup}>
                        <label style={label}>Phone Number <span style={required}>*</span></label>
                        <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="07XXXXXXXX"
                            maxLength={10}
                            style={phoneError ? fieldError : field}
                        />
                        {phoneError
                            ? <p style={errorText}>{phoneError}</p>
                            : <p style={hint}>10-digit Sri Lankan number (e.g. 0771234567)</p>
                        }
                    </div>

                    <hr style={divider} />

                    {/* ── Section: Booking Details ── */}
                    <div style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: 'var(--text-muted)',
                        marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <span>Booking Details</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    {/* Purpose */}
                    <div style={fieldGroup}>
                        <label style={label}>Purpose <span style={required}>*</span></label>
                        <textarea
                            required
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            rows={3}
                            placeholder="Briefly describe why you need this resource…"
                            style={{ ...field, resize: 'vertical' }}
                        />
                    </div>

                    {/* Recurrence */}
                    <div style={fieldGroup}>
                        <label style={label}>Recurrence</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            {[
                                { val: 'SINGLE', icon: '○', desc: 'One time' },
                                { val: 'DAILY',  icon: '◎', desc: 'Every day' },
                                { val: 'WEEKLY', icon: '◉', desc: 'Every week' },
                            ].map(({ val, icon, desc }) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => { setRecurrence(val); setRepeatUntil(''); }}
                                    style={{
                                        padding: '12px 8px',
                                        borderRadius: 10,
                                        border: recurrence === val ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: recurrence === val ? 'rgba(99,179,237,0.12)' : 'var(--surface)',
                                        color: recurrence === val ? 'var(--primary)' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        textAlign: 'center',
                                    }}
                                >
                                    <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                                    <div style={{ fontSize: 13, fontWeight: recurrence === val ? 700 : 400 }}>
                                        {val.charAt(0) + val.slice(1).toLowerCase()}
                                    </div>
                                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Repeat Until */}
                    {recurrence !== 'SINGLE' && (
                        <div style={fieldGroup}>
                            <label style={label}>Repeat Until <span style={required}>*</span></label>
                            <input
                                type="date"
                                required
                                min={minDateOnly}
                                value={repeatUntil}
                                onChange={(e) => setRepeatUntil(e.target.value)}
                                style={field}
                            />
                            {repeatUntil && startTime && (
                                <div style={{
                                    marginTop: 8, padding: '8px 12px', borderRadius: 8,
                                    background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.2)',
                                    fontSize: 13, color: 'var(--primary)',
                                }}>
                                    📅 Every {recurrence === 'DAILY' ? 'day' : 'week'} from{' '}
                                    {new Date(startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    {' '}until{' '}
                                    {new Date(repeatUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            )}
                        </div>
                    )}

                    <hr style={divider} />

                    {/* ── Section: Date & Time ── */}
                    <div style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: 'var(--text-muted)',
                        marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <span>Date &amp; Time</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    {/* Start & End side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        <div>
                            <label style={label}>Start <span style={required}>*</span></label>
                            <input
                                type="datetime-local"
                                required
                                min={minDateTime}
                                value={startTime}
                                onChange={handleStartChange}
                                style={field}
                            />
                        </div>
                        <div>
                            <label style={{ ...label, display: 'flex', alignItems: 'center', gap: 8 }}>
                                End <span style={required}>*</span>
                                {duration && (
                                    <span style={{
                                        fontSize: 11, fontWeight: 600,
                                        color: 'var(--primary)',
                                        background: 'rgba(99,179,237,0.12)',
                                        padding: '2px 8px', borderRadius: 20,
                                        textTransform: 'none', letterSpacing: 0,
                                    }}>
                                        {duration}
                                    </span>
                                )}
                            </label>
                            <input
                                type="datetime-local"
                                required
                                min={startTime || minDateTime}
                                value={endTime}
                                onChange={handleEndChange}
                                style={timeError ? fieldError : field}
                            />
                        </div>
                    </div>

                    {timeError && (
                        <p style={{ ...errorText, marginTop: -12, marginBottom: 16 }}>{timeError}</p>
                    )}

                    {/* ── Submit ── */}
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            width: '100%',
                            padding: '13px 20px',
                            borderRadius: 12,
                            border: 'none',
                            background: submitting ? 'var(--surface)' : 'var(--primary)',
                            color: submitting ? 'var(--text-muted)' : 'white',
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: submitting ? 'wait' : 'pointer',
                            marginTop: 8,
                            transition: 'all 0.2s',
                            letterSpacing: '0.02em',
                        }}
                    >
                        {submitting ? 'Submitting…' : 'Request Booking'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 14, marginBottom: 0 }}>
                        Your request will be reviewed by an admin before confirmation.
                    </p>

                </form>
            </div>
        </div>
    );
};

export default BookResource;