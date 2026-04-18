import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const styles = {
    page: { maxWidth: 520, margin: '32px auto', padding: '0 16px' },
    card: { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '32px 28px', fontFamily: 'inherit' },
    title: { fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: '#111111' },
    subtitle: { fontSize: 14, color: '#888888', margin: '0 0 24px' },
    field: { marginBottom: 16 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#222222', marginBottom: 6 },
    input: {
        width: '100%', boxSizing: 'border-box', background: '#f5f6f8',
        border: '1px solid #e5e7eb', borderRadius: 10, padding: '11px 14px',
        fontSize: 14, color: '#222222', outline: 'none',
    },
    textarea: {
        width: '100%', boxSizing: 'border-box', background: '#f5f6f8',
        border: '1px solid #e5e7eb', borderRadius: 10, padding: '11px 14px',
        fontSize: 14, color: '#222222', outline: 'none', resize: 'vertical', minHeight: 90,
    },
    toggleGroup: { display: 'flex', background: '#f5f6f8', borderRadius: 10, padding: 4, gap: 4 },
    toggleBtn: (active) => ({
        flex: 1, border: active ? '1.5px solid #16a34a' : '1.5px solid transparent',
        background: active ? '#ffffff' : 'transparent',
        color: active ? '#16a34a' : '#555555',
        borderRadius: 8, padding: '8px 0', fontSize: 13,
        fontWeight: active ? 600 : 500, cursor: 'pointer', transition: 'all 0.15s',
    }),
    errorText: { fontSize: 12, color: '#e24b4a', marginTop: 4 },
    submitBtn: {
        width: '100%', background: '#16a34a', color: '#ffffff', border: 'none',
        borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 600,
        cursor: 'pointer', marginTop: 8,
    },
    submitBtnDisabled: {
        width: '100%', background: '#86efac', color: '#ffffff', border: 'none',
        borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 600,
        cursor: 'not-allowed', marginTop: 8,
    },
};

const RECURRENCE_OPTIONS = [
    { value: 'SINGLE', label: 'Single' },
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
];

// Duration preset buttons: label → minutes to add from start
const DURATION_PRESETS = [
    { label: '30 min', mins: 30 },
    { label: '1 hr',   mins: 60 },
    { label: '2 hr',   mins: 120 },
    { label: '4 hr',   mins: 240 },
];

const addMinutes = (isoStr, mins) => {
    const d = new Date(isoStr);
    d.setMinutes(d.getMinutes() + mins);
    return d.toISOString().slice(0, 16);
};

const getDuration = (startTime, endTime) => {
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
    const [recurrence, setRecurrence] = useState('SINGLE');
    const [submitting, setSubmitting] = useState(false);

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

    // When start changes: auto-set end to start + 1 hour
    const handleStartChange = (e) => {
        const val = e.target.value;
        setStartTime(val);
        setTimeError('');
        if (val) {
            setEndTime(addMinutes(val, 60));
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

    // Preset button: set end time relative to start
    const applyPreset = (mins) => {
        if (!startTime) {
            showNotification('Please select a start time first', 'error');
            return;
        }
        setEndTime(addMinutes(startTime, mins));
        setTimeError('');
    };

    const submit = async (e) => {
        e.preventDefault();

        if (phoneNumber.length !== 10) {
            setPhoneError('Must be exactly 10 digits');
            return;
        }
        if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
            setTimeError('End time must be after start time');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/bookings', {
                resourceLabel: resourceName || id,
                resourceId: Number(id),
                userId: user?.id,
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

    const duration = getDuration(startTime, endTime);

    // Which preset is currently active (exact match)
    const activePreset = startTime
        ? DURATION_PRESETS.find(p => addMinutes(startTime, p.mins) === endTime)?.mins ?? null
        : null;

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Book resource</h1>
                <p style={styles.subtitle}>{resourceName || 'Loading...'}</p>

                <form onSubmit={submit}>

                    {/* Full Name */}
                    <div style={styles.field}>
                        <label style={styles.label}>Full name</label>
                        <input
                            type="text" required value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name" style={styles.input}
                        />
                    </div>

                    {/* Phone */}
                    <div style={styles.field}>
                        <label style={styles.label}>Phone number</label>
                        <input
                            type="tel" required value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="07XXXXXXXX" maxLength={10} style={styles.input}
                        />
                        {phoneError && <p style={styles.errorText}>{phoneError}</p>}
                    </div>

                    {/* Purpose */}
                    <div style={styles.field}>
                        <label style={styles.label}>Purpose</label>
                        <textarea
                            required value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="Describe your purpose for booking this resource..."
                            style={styles.textarea}
                        />
                    </div>

                    {/* Recurrence */}
                    <div style={styles.field}>
                        <label style={styles.label}>Recurrence</label>
                        <div style={styles.toggleGroup}>
                            {RECURRENCE_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value} type="button"
                                    onClick={() => setRecurrence(value)}
                                    style={styles.toggleBtn(recurrence === value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Repeat Until */}
                    {recurrence !== 'SINGLE' && (
                        <div style={styles.field}>
                            <label style={styles.label}>Repeat until</label>
                            <input
                                type="date" min={minDateOnly} value={repeatUntil}
                                onChange={(e) => setRepeatUntil(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                    )}

                    {/* Start Time */}
                    <div style={styles.field}>
                        <label style={styles.label}>Start</label>
                        <input
                            type="datetime-local" required min={minDateTime}
                            value={startTime} onChange={handleStartChange}
                            style={styles.input}
                        />
                    </div>

                    {/* End Time + presets */}
                    <div style={styles.field}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <label style={{ ...styles.label, margin: 0 }}>End</label>
                            {duration && !timeError && (
                                <span style={{
                                    fontSize: 12, fontWeight: 600, color: '#16a34a',
                                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                                    borderRadius: 20, padding: '2px 10px',
                                }}>
                                    {duration}
                                </span>
                            )}
                        </div>

                        {/* Duration preset buttons */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                            {DURATION_PRESETS.map(({ label, mins }) => (
                                <button
                                    key={mins} type="button"
                                    onClick={() => applyPreset(mins)}
                                    style={{
                                        flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 600,
                                        borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                                        border: activePreset === mins ? '1.5px solid #16a34a' : '1.5px solid #e5e7eb',
                                        background: activePreset === mins ? '#f0fdf4' : '#f5f6f8',
                                        color: activePreset === mins ? '#16a34a' : '#555',
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <input
                            type="datetime-local" required
                            min={startTime || minDateTime}
                            value={endTime} onChange={handleEndChange}
                            style={styles.input}
                        />
                        {timeError && <p style={styles.errorText}>{timeError}</p>}
                        {!timeError && !duration && startTime && (
                            <p style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
                                End time auto-set to 1 hour after start — adjust above or pick a preset
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={submitting}
                        style={submitting ? styles.submitBtnDisabled : styles.submitBtn}>
                        {submitting ? 'Submitting...' : 'Request booking'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default BookResource;