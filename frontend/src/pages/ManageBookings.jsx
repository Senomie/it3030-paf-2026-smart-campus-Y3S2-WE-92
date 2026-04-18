import React, { useContext, useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { NotificationContext } from '../context/NotificationContext';

// ── Date formatter ──────────────────────────────────────────
const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const formatDateOnly = (iso) => {
    if (!iso) return '';
    return new Date(iso).toDateString();
};

// ── Styles ───────────────────────────────────────────────────
const btnPrimary = {
    padding: '10px 16px', borderRadius: 10, border: 'none',
    background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer',
};

const btnDanger = {
    ...btnPrimary,
    background: 'rgba(239,68,68,0.2)',
    color: '#fecaca',
    border: '1px solid rgba(239,68,68,0.35)',
};

const btnSecondary = {
    ...btnPrimary,
    background: 'var(--surface)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
};

// ── Stat Card ────────────────────────────────────────────────
const StatCard = ({ label, count, accentColor }) => (
    <div style={{
        background: 'var(--surface)',
        borderRadius: 14,
        padding: '22px 24px',
        borderLeft: `3px solid ${accentColor}`,
        flex: 1,
        minWidth: 0,
    }}>
        <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
        }}>
            {label}
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-main)' }}>
            {count}
        </div>
    </div>
);

// ── Rejection Modal ─────────────────────────────────────────
const RejectModal = ({ onConfirm, onCancel }) => {
    const [reason, setReason] = useState('');
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
            <div className="premium-card" style={{ width: 420, padding: 28 }}>
                <h2 style={{ marginTop: 0, marginBottom: 8 }}>Reject Booking</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                    Provide a reason (optional) — this will be shown to the user.
                </p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Slot already reserved for maintenance…"
                    rows={4}
                    style={{
                        width: '100%', borderRadius: 10, padding: 12,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        color: 'var(--text-main)', resize: 'vertical', boxSizing: 'border-box',
                        marginBottom: 20,
                    }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => onConfirm(reason)} style={btnDanger}>
                        Confirm Reject
                    </button>
                    <button type="button" onClick={onCancel} style={btnSecondary}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Day Bookings Modal ──────────────────────────────────────
const DayBookingsModal = ({ dateStr, bookings, onClose }) => {
    const dayBookings = bookings.filter(b => formatDateOnly(b.startTime) === dateStr);
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
            <div className="premium-card" style={{ width: 480, padding: 28, maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0 }}>Bookings on {dateStr}</h2>
                    <button type="button" onClick={onClose} style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        fontSize: 22, cursor: 'pointer', lineHeight: 1,
                    }}>✕</button>
                </div>
                {dayBookings.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No bookings for this day.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {dayBookings.map(b => (
                            <div key={b.id} style={{
                                padding: 16, borderRadius: 12,
                                background: 'var(--surface)', border: '1px solid var(--border)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontWeight: 700, fontSize: 15 }}>{b.resourceLabel}</span>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                                        background: b.status === 'APPROVED' ? 'rgba(16,185,129,0.15)' : b.status === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                        color: b.status === 'APPROVED' ? '#10b981' : b.status === 'REJECTED' ? '#f87171' : '#f59e0b',
                                    }}>{b.status}</span>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                                    👤 {b.fullName || `User #${b.userId}`}  {b.phoneNumber || '—'}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                                    🕐 {formatDate(b.startTime)} → {formatDate(b.endTime)}
                                </div>
                                <div style={{ fontSize: 13 }}>{b.purpose}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Calendar ────────────────────────────────────────────────
const BookingCalendar = ({ bookings, onDayClick }) => {
    const [calDate, setCalDate] = useState(new Date());
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const monthName = calDate.toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const countMap = {};
    bookings.forEach(b => {
        const key = formatDateOnly(b.startTime);
        countMap[key] = (countMap[key] || 0) + 1;
    });

    const dotColor = (count) => {
        if (count >= 5) return '#f87171';
        if (count >= 3) return '#fb923c';
        return '#34d399';
    };

    return (
        <div className="premium-card" style={{ padding: 24, marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <button type="button" onClick={() => setCalDate(new Date(year, month - 1, 1))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: 22 }}>‹</button>
                <span style={{ fontWeight: 700, fontSize: 17 }}>{monthName} {year}</span>
                <button type="button" onClick={() => setCalDate(new Date(year, month + 1, 1))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: 22 }}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 10 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', paddingBottom: 6 }}>{d}</div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = new Date(year, month, day).toDateString();
                    const count = countMap[dateStr] || 0;
                    const isToday = new Date().toDateString() === dateStr;
                    const isBooked = count > 0;
                    return (
                        <div key={day}
                            onClick={() => isBooked && onDayClick(dateStr)}
                            style={{
                                padding: '8px 4px', borderRadius: 10, textAlign: 'center',
                                cursor: isBooked ? 'pointer' : 'default',
                                background: isBooked ? 'rgba(99,179,237,0.08)' : 'transparent',
                                border: isToday ? '1.5px solid var(--primary)' : isBooked ? '1px solid rgba(99,179,237,0.2)' : '1px solid transparent',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (isBooked) e.currentTarget.style.background = 'rgba(99,179,237,0.18)'; }}
                            onMouseLeave={e => { if (isBooked) e.currentTarget.style.background = 'rgba(99,179,237,0.08)'; }}
                        >
                            <div style={{
                                fontSize: 13, fontWeight: isToday ? 700 : 400,
                                color: isToday ? 'var(--primary)' : 'var(--text-main)', marginBottom: 4,
                            }}>{day}</div>
                            {isBooked && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                                    {Array.from({ length: Math.min(count, 4) }).map((_, di) => (
                                        <div key={di} style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor(count) }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                {[['#34d399', '1–2 bookings'], ['#fb923c', '3–4 bookings'], ['#f87171', '5+ bookings']].map(([c, label]) => (
                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />
                        {label}
                    </span>
                ))}
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, border: '1.5px solid var(--primary)', display: 'inline-block' }} />
                    Today
                </span>
            </div>
        </div>
    );
};

// ── Main Component ───────────────────────────────────────────
const ManageBookings = () => {
    const { showNotification } = useContext(NotificationContext);
    const [rows, setRows] = useState([]);
    const [allRows, setAllRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PENDING');
    const [view, setView] = useState('list');
    const [rejectTarget, setRejectTarget] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    // Always fetch all bookings for stat card counts (unaffected by tab filter)
    const loadAll = async () => {
        try {
            const res = await api.get(`/bookings/all`);
            setAllRows(res.data);
        } catch (e) {
            // silent
        }
    };

    const load = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'ALL' ? '/bookings/all' : `/bookings/all?status=${activeTab}`;
            const res = await api.get(endpoint);
            setRows(res.data);
        } catch (e) {
            showNotification(e.response?.data?.error || 'Failed to load bookings', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load global counts once on mount and after decisions
    useEffect(() => {
        loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const decide = async (id, approved, reason = null) => {
        try {
            await api.patch(`/bookings/${id}/decision`, { approved, reason: reason || null });
            showNotification(approved ? 'Booking approved.' : 'Booking rejected.', 'success');
            setRejectTarget(null);
            load();
            loadAll();
        } catch (e) {
            showNotification(e.response?.data?.error || 'Update failed', 'error');
        }
    };

    const recurrenceBadge = (r) => {
        const colors = { SINGLE: '#6366f1', DAILY: '#f59e0b', WEEKLY: '#10b981' };
        return (
            <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                background: `${colors[r] || '#6366f1'}22`,
                color: colors[r] || '#6366f1',
                border: `1px solid ${colors[r] || '#6366f1'}55`,
                marginLeft: 8,
            }}>{r || 'SINGLE'}</span>
        );
    };

    const tabs = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

    // ── Derived counts for stat cards ──
    const pendingCount = allRows.filter(r => r.status === 'PENDING').length;
    const approvedCount = allRows.filter(r => r.status === 'APPROVED').length;
    const rejectedCount = allRows.filter(r => r.status === 'REJECTED').length;

    return (
        <div style={{ maxWidth: 960, margin: '24px auto', padding: '0 20px' }}>

            {/* ── Page Title ── */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Manage Bookings</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
                    Review, approve, and reject resource bookings.
                </p>
            </div>

            {/* ── Stat Cards ── */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
                <StatCard label="Pending" count={pendingCount} accentColor="#f87171" />
                <StatCard label="Approved" count={approvedCount} accentColor="#f59e0b" />
                <StatCard label="Rejected" count={rejectedCount} accentColor="#34d399" />
            </div>

            {/* ── Toolbar: tabs + view toggle ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                {/* Status tabs */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {tabs.map(tab => (
                        <button key={tab} type="button"
                            onClick={() => { setActiveTab(tab); setSelectedDate(null); }}
                            style={{
                                padding: '8px 16px', borderRadius: 10, border: 'none',
                                cursor: 'pointer', fontWeight: 700, fontSize: 12,
                                background: activeTab === tab ? 'var(--primary)' : 'var(--surface)',
                                color: activeTab === tab ? 'white' : 'var(--text-muted)',
                                transition: 'all 0.15s',
                            }}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* View toggle */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 1, height: 28, background: 'var(--border)', marginRight: 4 }} />
                    <button type="button" onClick={() => setView('list')}
                        style={{
                            padding: '8px 16px', borderRadius: 10, border: 'none',
                            cursor: 'pointer', fontWeight: 700, fontSize: 12,
                            background: view === 'list' ? 'var(--primary)' : 'var(--surface)',
                            color: view === 'list' ? 'white' : 'var(--text-muted)',
                            transition: 'all 0.15s',
                        }}>
                        ☰ List
                    </button>
                    <button type="button" onClick={() => setView('calendar')}
                        style={{
                            padding: '8px 16px', borderRadius: 10, border: 'none',
                            cursor: 'pointer', fontWeight: 700, fontSize: 12,
                            background: view === 'calendar' ? 'var(--primary)' : 'var(--surface)',
                            color: view === 'calendar' ? 'white' : 'var(--text-muted)',
                            transition: 'all 0.15s',
                        }}>
                        📅 Calendar
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: 48, color: 'var(--text-muted)' }}>Loading…</div>
            ) : view === 'calendar' ? (
                /* ── Calendar View ── */
                <BookingCalendar
                    bookings={rows}
                    onDayClick={(dateStr) => setSelectedDate(dateStr)}
                />
            ) : (
                /* ── Card List View ── */
                rows.length === 0 ? (
                    <div style={{
                        background: 'var(--surface)', borderRadius: 14,
                        border: '1px solid var(--border)', padding: '56px 20px', textAlign: 'center',
                    }}>
                        
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 16 }}>
                        {rows.map((b) => (
                            <div key={b.id} className="premium-card" style={{ padding: 20 }}>

                                {/* ── Header row: resource + recurrence badge + status ── */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                                        <span style={{ fontWeight: 700, fontSize: 16 }}>{b.resourceLabel}</span>
                                        {recurrenceBadge(b.recurrence)}
                                    </div>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                                        background: b.status === 'APPROVED' ? 'rgba(16,185,129,0.15)'
                                            : b.status === 'REJECTED' ? 'rgba(239,68,68,0.15)'
                                            : 'rgba(245,158,11,0.15)',
                                        color: b.status === 'APPROVED' ? '#10b981'
                                            : b.status === 'REJECTED' ? '#f87171'
                                            : '#f59e0b',
                                    }}>
                                        {b.status}
                                    </span>
                                </div>

                                {/* ── User details ── */}
                                <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                    <span>👤 {b.fullName || `User #${b.userId}`}</span>
                                    <span>📞 {b.phoneNumber || '—'}</span>
                                </div>

                                {/* ── Purpose ── */}
                                <p style={{ margin: '12px 0 0', fontSize: 14 }}>{b.purpose}</p>

                                {/* ── Times ── */}
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>
                                    🕐 {formatDate(b.startTime)} → {formatDate(b.endTime)}
                                </div>

                                {/* ── Rejection reason ── */}
                                {b.adminReason && (
                                    <div style={{
                                        marginTop: 10, padding: '8px 12px', borderRadius: 8,
                                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                        fontSize: 13, color: '#fca5a5',
                                    }}>
                                        ✕ Rejection reason: {b.adminReason}
                                    </div>
                                )}

                                {/* ── Actions ── */}
                                {b.status === 'PENDING' && (
                                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                                        <button type="button" onClick={() => decide(b.id, true)} style={btnPrimary}>✓ Approve</button>
                                        <button type="button" onClick={() => setRejectTarget(b.id)} style={btnDanger}>✕ Reject</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* ── Reject Modal ── */}
            {rejectTarget && (
                <RejectModal
                    onConfirm={(reason) => decide(rejectTarget, false, reason)}
                    onCancel={() => setRejectTarget(null)}
                />
            )}

            {/* ── Day Bookings Modal ── */}
            {selectedDate && (
                <DayBookingsModal
                    dateStr={selectedDate}
                    bookings={rows}
                    onClose={() => setSelectedDate(null)}
                />
            )}
        </div>
    );
};

export default ManageBookings;