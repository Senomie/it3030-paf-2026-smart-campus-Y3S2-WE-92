import React, { useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { NotificationContext } from '../context/NotificationContext';

const FILTERS = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const statusColors = {
    PENDING:  { bg: '#fff8e1', color: '#b45309', border: '#fcd34d' },
    APPROVED: { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
    REJECTED: { bg: '#fff1f2', color: '#be123c', border: '#fda4af' },
};

const S = {
    page: { maxWidth: 960, margin: '32px auto', padding: '0 24px', fontFamily: 'inherit' },
    title: { fontSize: 26, fontWeight: 700, margin: '0 0 4px', color: '#111' },
    subtitle: { fontSize: 14, color: '#888', margin: '0 0 24px' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
    statCard: (borderColor) => ({
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
        padding: '20px 24px', borderTop: `3px solid ${borderColor}`,
    }),
    statLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#888', marginBottom: 10 },
    statNumber: { fontSize: 36, fontWeight: 700, color: '#111', lineHeight: 1 },
    controlsRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' },
    filterGroup: { display: 'flex', gap: 6 },
    filterBtn: (active) => ({
        padding: '7px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
        background: active ? '#16a34a' : '#fff', color: active ? '#fff' : '#444',
        fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
    }),
    viewGroup: { display: 'flex', gap: 6 },
    viewBtn: (active) => ({
        padding: '7px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
        background: active ? '#16a34a' : '#fff', color: active ? '#fff' : '#444',
        fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
    }),
    container: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' },
    bookingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', gap: 16, flexWrap: 'wrap' },
    bookingLeft: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 },
    bookingResource: { fontSize: 15, fontWeight: 600, color: '#111' },
    bookingMeta: { fontSize: 13, color: '#888' },
    bookingPurpose: { fontSize: 13, color: '#555', marginTop: 2 },
    bookingRight: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
    statusBadge: (status) => {
        const t = statusColors[status] || { bg: '#f5f5f5', color: '#555', border: '#ddd' };
        return { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: t.bg, color: t.color, border: `1px solid ${t.border}` };
    },
    approveBtn: { padding: '7px 16px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
    rejectBtn: { padding: '7px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
};

// ── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ booking, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    if (!booking) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '28px', width: 420, maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: '#111' }}>Reject booking</h2>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 18px' }}>
                    <strong style={{ color: '#111' }}>{booking.resourceLabel}</strong> — {booking.fullName}
                </p>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
                    Reason <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="e.g. Resource unavailable during this time..."
                    rows={4}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#f5f6f8', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: '#222', resize: 'vertical', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#444', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button onClick={() => onConfirm(reason)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        Confirm reject
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Day Detail Modal ──────────────────────────────────────────────────────────
const DayModal = ({ date, bookings, onClose, onApprove, onRejectClick }) => {
    if (!date) return null;
    const label = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '28px', width: 500, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Bookings</h2>
                        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{label}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>✕</button>
                </div>
                {bookings.length === 0 ? (
                    <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No bookings on this day.</p>
                ) : bookings.map(b => (
                    <div key={b.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{b.resourceLabel}</span>
                            <span style={S.statusBadge(b.status)}>{b.status}</span>
                        </div>
                        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#555' }}><strong>By:</strong> {b.fullName} · {b.phoneNumber}</p>
                        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#555' }}><strong>Purpose:</strong> {b.purpose}</p>
                        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#888' }}>{fmt(b.startTime)} → {fmt(b.endTime)}</p>
                        {b.rejectionReason && (
                            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#dc2626' }}><strong>Reason:</strong> {b.rejectionReason}</p>
                        )}
                        {b.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button style={S.approveBtn} onClick={() => onApprove(b.id)}>Approve</button>
                                <button style={S.rejectBtn} onClick={() => onRejectClick(b)}>Reject</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Calendar View ─────────────────────────────────────────────────────────────
const Calendar = ({ bookings, onDayClick }) => {
    const [current, setCurrent] = useState(new Date());
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const bookingDates = {};
    bookings.forEach(b => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (d.getFullYear() === year && d.getMonth() === month) {
                const key = d.getDate();
                if (!bookingDates[key]) bookingDates[key] = [];
                bookingDates[key].push(b);
            }
        }
    });

    const today = new Date();

    const dotColor = (bks) => {
        if (bks.some(b => b.status === 'PENDING')) return '#f59e0b';
        if (bks.some(b => b.status === 'APPROVED')) return '#22c55e';
        return '#ef4444';
    };

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div style={{ padding: '20px' }}>
            {/* Month nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <button onClick={() => setCurrent(new Date(year, month - 1, 1))} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 16, color: '#555' }}>‹</button>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>{MONTHS[month]} {year}</span>
                <button onClick={() => setCurrent(new Date(year, month + 1, 1))} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 16, color: '#555' }}>›</button>
            </div>
            {/* Day names */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {DAYS.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#aaa', padding: '4px 0' }}>{d}</div>
                ))}
            </div>
            {/* Date cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {cells.map((day, i) => {
                    if (!day) return <div key={`e${i}`} />;
                    const bks = bookingDates[day] || [];
                    const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                    const hasBooking = bks.length > 0;
                    return (
                        <div
                            key={day}
                            onClick={() => onDayClick(new Date(year, month, day), bks)}
                            style={{
                                position: 'relative', textAlign: 'center',
                                padding: '10px 4px 16px', borderRadius: 10,
                                cursor: hasBooking ? 'pointer' : 'default',
                                background: hasBooking ? '#f0fdf4' : 'transparent',
                                border: isToday ? '2px solid #16a34a' : '2px solid transparent',
                                fontWeight: isToday ? 700 : 400,
                                color: isToday ? '#16a34a' : '#222',
                                fontSize: 14, transition: 'background 0.1s',
                            }}
                        >
                            {day}
                            {hasBooking && (
                                <span style={{
                                    position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
                                    width: 6, height: 6, borderRadius: '50%', background: dotColor(bks), display: 'block',
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 20, justifyContent: 'center' }}>
                {[['#f59e0b', 'Pending'], ['#22c55e', 'Approved'], ['#ef4444', 'Rejected']].map(([color, label]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const ManageBookings = () => {
    const { showNotification } = useContext(NotificationContext);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [view, setView] = useState('list');
    const [rejectTarget, setRejectTarget] = useState(null);
    const [dayModal, setDayModal] = useState({ date: null, bookings: [] });

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bookings/all');
            setRows(res.data);
        } catch {
            showNotification('Failed to load bookings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const approve = async (id) => {
        try {
            await api.patch(`/bookings/${id}/decision`, { approved: true });
            showNotification('Approved', 'success');
            setDayModal({ date: null, bookings: [] });
            load();
        } catch {
            showNotification('Update failed', 'error');
        }
    };

    const confirmReject = async (reason) => {
        try {
            await api.patch(`/bookings/${rejectTarget.id}/decision`, { approved: false, reason });
            showNotification('Rejected', 'success');
            setRejectTarget(null);
            load();
        } catch {
            showNotification('Update failed', 'error');
        }
    };

    const openRejectFromDay = (b) => {
        setDayModal({ date: null, bookings: [] });
        setRejectTarget(b);
    };

    const count = (status) => rows.filter(r => r.status === status).length;
    const filtered = filter === 'ALL' ? rows : rows.filter(r => r.status === filter);

    return (
        <div style={S.page}>
            <h1 style={S.title}>Manage Bookings</h1>
            <p style={S.subtitle}>Review, approve, and reject resource bookings.</p>

            {/* Stats */}
            <div style={S.statsRow}>
                <div style={S.statCard('#f87171')}>
                    <div style={S.statLabel}>PENDING</div>
                    <div style={S.statNumber}>{count('PENDING')}</div>
                </div>
                <div style={S.statCard('#facc15')}>
                    <div style={S.statLabel}>APPROVED</div>
                    <div style={S.statNumber}>{count('APPROVED')}</div>
                </div>
                <div style={S.statCard('#4ade80')}>
                    <div style={S.statLabel}>REJECTED</div>
                    <div style={S.statNumber}>{count('REJECTED')}</div>
                </div>
            </div>

            {/* Controls */}
            <div style={S.controlsRow}>
                <div style={S.filterGroup}>
                    {FILTERS.map(f => (
                        <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
                <div style={S.viewGroup}>
                    <button style={S.viewBtn(view === 'list')} onClick={() => setView('list')}>☰ List</button>
                    <button style={S.viewBtn(view === 'calendar')} onClick={() => setView('calendar')}>📅 Calendar</button>
                </div>
            </div>

            {/* Main content */}
            <div style={S.container}>
                {loading ? (
                    <div style={S.emptyState}><p style={{ color: '#aaa', fontSize: 14 }}>Loading...</p></div>
                ) : view === 'calendar' ? (
                    <Calendar bookings={rows} onDayClick={(date, bks) => setDayModal({ date, bookings: bks })} />
                ) : filtered.length === 0 ? (
                    <div style={S.emptyState}>
                        <div style={{ fontSize: 28, color: '#ccc', marginBottom: 8 }}>✦</div>
                        <p style={{ color: '#aaa', fontSize: 14 }}>No bookings found.</p>
                    </div>
                ) : (
                    filtered.map((b, i) => (
                        <div key={b.id} style={{ ...S.bookingRow, borderBottom: i === filtered.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
                            <div style={S.bookingLeft}>
                                <div style={S.bookingResource}>{b.resourceLabel}</div>
                                <div style={S.bookingMeta}>{b.fullName} · {b.phoneNumber}</div>
                                <div style={S.bookingPurpose}>{b.purpose}</div>
                                <div style={{ ...S.bookingMeta, marginTop: 4 }}>{fmt(b.startTime)} → {fmt(b.endTime)}</div>
                                {b.rejectionReason && (
                                    <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>Reason: {b.rejectionReason}</div>
                                )}
                            </div>
                            <div style={S.bookingRight}>
                                <span style={S.statusBadge(b.status)}>{b.status}</span>
                                {b.status === 'PENDING' && (
                                    <>
                                        <button style={S.approveBtn} onClick={() => approve(b.id)}>Approve</button>
                                        <button style={S.rejectBtn} onClick={() => setRejectTarget(b)}>Reject</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            <RejectModal booking={rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={confirmReject} />
            <DayModal
                date={dayModal.date}
                bookings={dayModal.bookings}
                onClose={() => setDayModal({ date: null, bookings: [] })}
                onApprove={approve}
                onRejectClick={openRejectFromDay}
            />
        </div>
    );
};

export default ManageBookings;