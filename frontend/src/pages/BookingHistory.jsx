import { useState, useEffect } from "react";
import api from "../api/axiosConfig";

const STATUS_CONFIG = {
  APPROVED: { label: "Approved", bg: "#EAF3DE", color: "#3B6D11", dot: "#639922" },
  PENDING:  { label: "Pending",  bg: "#FAEEDA", color: "#854F0B", dot: "#EF9F27" },
  REJECTED: { label: "Rejected", bg: "#FCEBEB", color: "#A32D2D", dot: "#E24B4A" },
  CANCELLED:{ label: "Cancelled",bg: "#F1EFE8", color: "#5F5E5A", dot: "#888780" },
};

const FILTER_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function parseDateTime(val) {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    const [y, mo, d, h = 0, min = 0] = val;
    return `${y}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}T${String(h).padStart(2,"0")}:${String(min).padStart(2,"0")}`;
  }
  return null;
}

function toDatetimeLocal(val) {
  const iso = parseDateTime(val);
  if (!iso) return "";
  return iso.slice(0, 16);
}

function normalize(b) {
  return {
    id:           b.id,
    resourceLabel:b.resourceLabel  ?? b.resource_label  ?? "",
    purpose:      b.purpose        ?? "",
    startTime:    parseDateTime(b.startTime ?? b.start_time),
    endTime:      parseDateTime(b.endTime   ?? b.end_time),
    status:       b.status         ?? "PENDING",
    adminReason:  b.adminReason    ?? b.admin_reason    ?? null,
    fullName:     b.fullName       ?? b.full_name       ?? "",
    phoneNumber:  b.phoneNumber    ?? b.phone_number    ?? "",
    recurrence:   b.recurrence     ?? "SINGLE",
  };
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}
function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 10px",
      borderRadius:20, fontSize:12, fontWeight:600, background:cfg.bg, color:cfg.color, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
      {cfg.label}
    </span>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ booking, onClose, onSaved }) {
  const [purpose,     setPurpose]     = useState(booking.purpose);
  const [startTime,   setStartTime]   = useState(toDatetimeLocal(booking.startTime));
  const [endTime,     setEndTime]     = useState(toDatetimeLocal(booking.endTime));
  const [fullName,    setFullName]    = useState(booking.fullName);
  const [phoneNumber, setPhoneNumber] = useState(booking.phoneNumber);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(endTime) <= new Date(startTime)) { setError("End time must be after start time"); return; }
    setSaving(true); setError(null);
    try {
      await api.put(`/bookings/${booking.id}`, {
        purpose, startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(), fullName, phoneNumber, recurrence: booking.recurrence,
      });
      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Update failed");
    } finally { setSaving(false); }
  };

  const inputStyle = {
    width:"100%", boxSizing:"border-box", background:"#f9f9f9",
    border:"1px solid #dddddd", borderRadius:8, padding:"10px 12px",
    fontSize:14, color:"#1a1a1a", outline:"none",
  };
  const labelStyle = { display:"block", fontSize:13, fontWeight:600, color:"#1a1a1a", marginBottom:6 };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex",
      alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#ffffff", borderRadius:14, padding:28, width:460,
        maxWidth:"92vw", maxHeight:"90vh", overflowY:"auto",
        border:"1px solid #dddddd", boxShadow:"0 8px 32px rgba(0,0,0,0.10)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ fontSize:18, fontWeight:700, margin:0, color:"#1a1a1a" }}>Edit booking</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20,
            cursor:"pointer", color:"#aaaaaa", lineHeight:1 }}>✕</button>
        </div>
        <p style={{ fontSize:13, color:"#888888", margin:"0 0 20px" }}>{booking.resourceLabel}</p>

        <form onSubmit={handleSubmit}>
          {[
            { label:"Purpose", el: <textarea required value={purpose} onChange={e=>setPurpose(e.target.value)} rows={3} style={{...inputStyle,resize:"vertical"}} /> },
            { label:"Full name", el: <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} style={inputStyle} /> },
            { label:"Phone number", el: <input type="tel" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} style={inputStyle} /> },
            { label:"Start time", el: <input type="datetime-local" required value={startTime} onChange={e=>setStartTime(e.target.value)} style={inputStyle} /> },
            { label:"End time", el: <input type="datetime-local" required value={endTime} onChange={e=>setEndTime(e.target.value)} style={inputStyle} /> },
          ].map(({ label, el }) => (
            <div key={label} style={{ marginBottom:14 }}>
              <label style={labelStyle}>{label}</label>
              {el}
            </div>
          ))}

          {error && (
            <p style={{ fontSize:13, color:"#dc2626", margin:"0 0 12px",
              background:"#fff1f2", padding:"8px 12px", borderRadius:8 }}>{error}</p>
          )}

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
            <button type="button" onClick={onClose}
              style={{ padding:"9px 20px", borderRadius:9, border:"1.5px solid #dddddd",
                background:"#ffffff", color:"#555555", fontWeight:600, fontSize:13, cursor:"pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ padding:"9px 20px", borderRadius:9, border:"none",
                background: saving ? "#bbbbbb" : "#1a1a1a", color:"#ffffff",
                fontWeight:600, fontSize:13, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Cancel Confirm Modal ──────────────────────────────────────────────────────
function CancelModal({ booking, onClose, onConfirmed }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleCancel = async () => {
    setLoading(true); setError(null);
    try {
      await api.delete(`/bookings/${booking.id}`);
      onConfirmed(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Cancellation failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex",
      alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#ffffff", borderRadius:14, padding:28, width:400,
        maxWidth:"92vw", border:"1px solid #dddddd", boxShadow:"0 8px 32px rgba(0,0,0,0.10)" }}>
        <h2 style={{ fontSize:18, fontWeight:700, margin:"0 0 8px", color:"#1a1a1a" }}>Cancel booking?</h2>
        <p style={{ fontSize:14, color:"#333333", margin:"0 0 4px" }}>
          <strong>{booking.resourceLabel}</strong>
        </p>
        <p style={{ fontSize:13, color:"#888888", margin:"0 0 16px" }}>
          {formatDate(booking.startTime)} · {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
        </p>
        <p style={{ fontSize:13, color:"#555555", margin:"0 0 20px",
          background:"#f9f9f9", border:"1px solid #dddddd", borderRadius:8, padding:"10px 12px" }}>
          This will mark the booking as <strong>Cancelled</strong> and cannot be undone.
        </p>
        {error && (
          <p style={{ fontSize:13, color:"#dc2626", background:"#fff1f2",
            padding:"8px 12px", borderRadius:8, margin:"0 0 14px" }}>{error}</p>
        )}
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose}
            style={{ padding:"9px 20px", borderRadius:9, border:"1.5px solid #dddddd",
              background:"#ffffff", color:"#555555", fontWeight:600, fontSize:13, cursor:"pointer" }}>
            Keep it
          </button>
          <button onClick={handleCancel} disabled={loading}
            style={{ padding:"9px 20px", borderRadius:9, border:"none",
              background: loading ? "#bbbbbb" : "#1a1a1a", color:"#ffffff",
              fontWeight:600, fontSize:13, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Cancelling…" : "Yes, cancel booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({ booking, onClose, onEdit, onCancel }) {
  if (!booking) return null;
  const canEdit   = booking.status === "PENDING";
  const canCancel = booking.status === "PENDING" || booking.status === "APPROVED";

  return (
    <div style={{ background:"#ffffff", border:"1px solid #dddddd",
      borderRadius:12, padding:20, position:"sticky", top:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <div>
          <div style={{ fontSize:11, color:"#aaaaaa", marginBottom:4,
            textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700 }}>
            Booking #{booking.id}
          </div>
          <div style={{ fontSize:15, fontWeight:700, color:"#1a1a1a", lineHeight:1.3 }}>
            {booking.resourceLabel}
          </div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer",
          color:"#aaaaaa", fontSize:20, lineHeight:1, padding:"2px 6px" }}>×</button>
      </div>

      <div style={{ marginBottom:14 }}>
        <StatusBadge status={booking.status} />
      </div>

      <div style={{ borderTop:"1px solid #eeeeee", paddingTop:14 }}>
        <DetailRow label="Date"    value={formatDate(booking.startTime)} />
        <DetailRow label="Time"    value={`${formatTime(booking.startTime)} — ${formatTime(booking.endTime)}`} />
        <DetailRow label="Purpose" value={booking.purpose} multiline />
        {booking.fullName    && <DetailRow label="Name"  value={booking.fullName} />}
        {booking.phoneNumber && <DetailRow label="Phone" value={booking.phoneNumber} />}

        {booking.adminReason && (
          <div style={{ marginTop:12, padding:"10px 12px", borderRadius:8,
            background: booking.status === "REJECTED" ? "#FCEBEB" : "#EAF3DE",
            borderLeft: `3px solid ${booking.status === "REJECTED" ? "#E24B4A" : "#639922"}` }}>
            <div style={{ fontSize:11, fontWeight:700, marginBottom:4,
              color: booking.status === "REJECTED" ? "#A32D2D" : "#3B6D11" }}>
              {booking.status === "REJECTED" ? "Rejection reason" : "Admin note"}
            </div>
            <div style={{ fontSize:13, color: booking.status === "REJECTED" ? "#A32D2D" : "#3B6D11" }}>
              {booking.adminReason}
            </div>
          </div>
        )}
      </div>

      {(canEdit || canCancel) && (
        <div style={{ display:"flex", gap:8, marginTop:16, paddingTop:14, borderTop:"1px solid #eeeeee" }}>
          {canEdit && (
            <button onClick={onEdit}
              style={{ flex:1, padding:"8px 0", borderRadius:9, border:"1.5px solid #dddddd",
                background:"#ffffff", color:"#1a1a1a", fontWeight:600, fontSize:13, cursor:"pointer" }}>
              Edit
            </button>
          )}
          {canCancel && (
            <button onClick={onCancel}
              style={{ flex:1, padding:"8px 0", borderRadius:9, border:"1px solid #fecaca",
                background:"#fff1f2", color:"#dc2626", fontWeight:600, fontSize:13, cursor:"pointer" }}>
              Cancel booking
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, multiline }) {
  return (
    <div style={{ display:"flex", gap:8, marginBottom:10, alignItems: multiline ? "flex-start" : "center" }}>
      <span style={{ fontSize:12, color:"#aaaaaa", minWidth:72, fontWeight:600,
        paddingTop: multiline ? 1 : 0, textTransform:"uppercase", letterSpacing:"0.05em" }}>
        {label}
      </span>
      <span style={{ fontSize:13, color:"#1a1a1a", lineHeight:1.5, flex:1 }}>{value}</span>
    </div>
  );
}

// ── Table Row ─────────────────────────────────────────────────────────────────
function BookingRow({ booking, onClick, isSelected }) {
  return (
    <tr onClick={() => onClick(booking)}
      style={{ cursor:"pointer", borderBottom:"1px solid #eeeeee",
        background: isSelected ? "#f5f5f5" : "transparent", transition:"background 0.15s" }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f9f9f9"; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
      <td style={{ padding:"14px 16px" }}>
        <div style={{ fontWeight:700, fontSize:14, color:"#1a1a1a" }}>
          {booking.resourceLabel || "—"}
        </div>
      </td>
      <td style={{ padding:"14px 16px", maxWidth:240 }}>
        <div style={{ fontSize:13, color:"#888888",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {booking.purpose}
        </div>
      </td>
      <td style={{ padding:"14px 16px", whiteSpace:"nowrap" }}>
        <div style={{ fontSize:13, color:"#1a1a1a" }}>{formatDate(booking.startTime)}</div>
        <div style={{ fontSize:12, color:"#aaaaaa", marginTop:2 }}>
          {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
        </div>
      </td>
      <td style={{ padding:"14px 16px" }}>
        <StatusBadge status={booking.status} />
      </td>
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BookingHistory() {
  const [bookings,     setBookings]    = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [error,        setError]       = useState(null);
  const [filter,       setFilter]      = useState("ALL");
  const [selected,     setSelected]    = useState(null);
  const [search,       setSearch]      = useState("");
  const [editTarget,   setEditTarget]  = useState(null);
  const [cancelTarget, setCancelTarget]= useState(null);

  const load = () => {
    setLoading(true); setError(null);
    api.get("/bookings/mine")
      .then((res) => { setBookings(res.data.map(normalize)); setLoading(false); })
      .catch((err) => { setError("Failed to load bookings."); setLoading(false); console.error(err); });
  };

  useEffect(() => {
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, []);

  const handleSaved = () => { load(); setSelected(null); };

  const filtered = bookings.filter((b) => {
    const matchesStatus = filter === "ALL" || b.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q || b.resourceLabel.toLowerCase().includes(q) || b.purpose.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const counts = FILTER_OPTIONS.reduce((acc, s) => {
    acc[s] = s === "ALL" ? bookings.length : bookings.filter((b) => b.status === s).length;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily:"system-ui, sans-serif", padding:"36px 20px", maxWidth:1000, margin:"0 auto" }}>

      {/* Header — matches Dashboard welcome banner style */}
      <div style={{
        background:"#1a1a1a", borderRadius:14, padding:"28px 32px",
        marginBottom:28, display:"flex", alignItems:"center", gap:18,
      }}>
        <div style={{
          width:50, height:50, borderRadius:12, background:"#333333",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0,
        }}>📋</div>
        <div>
          <h1 style={{ margin:0, fontSize:22, color:"#eeeeee", fontWeight:800 }}>My Bookings</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:"#aaaaaa" }}>
            History of all your facility reservation requests
          </p>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <button onClick={load} disabled={loading}
            style={{
              fontSize:13, padding:"8px 16px", borderRadius:9,
              border:"1.5px solid #444444", background:"transparent",
              color:"#aaaaaa", cursor: loading ? "not-allowed" : "pointer", fontWeight:600,
            }}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Filter label */}
      <p style={{ fontSize:11, fontWeight:700, color:"#aaaaaa", textTransform:"uppercase",
        letterSpacing:"1px", marginBottom:14 }}>
        Filter &amp; Search
      </p>

      {/* Search + filters */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
            color:"#aaaaaa", fontSize:14, pointerEvents:"none" }}>⌕</span>
          <input type="text" placeholder="Search facility or purpose…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width:"100%", boxSizing:"border-box", paddingLeft:34, paddingRight:12,
              paddingTop:9, paddingBottom:9, borderRadius:9, border:"1px solid #dddddd",
              background:"#ffffff", fontSize:13, color:"#1a1a1a", outline:"none",
            }} />
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {FILTER_OPTIONS.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding:"7px 14px", fontSize:13, borderRadius:20, cursor:"pointer",
                border: filter === s ? "1.5px solid #1a1a1a" : "1px solid #dddddd",
                background: filter === s ? "#1a1a1a" : "#ffffff",
                color: filter === s ? "#ffffff" : "#888888",
                fontWeight: filter === s ? 700 : 400,
                transition:"all 0.15s",
              }}>
              {s === "ALL" ? "All" : STATUS_CONFIG[s]?.label}
              {counts[s] > 0 && (
                <span style={{ marginLeft:6, fontSize:11,
                  color: filter === s ? "#cccccc" : "#aaaaaa" }}>
                  {counts[s]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table + detail panel */}
      <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 290px" : "1fr", gap:16, alignItems:"start" }}>
        <div style={{ background:"#ffffff", border:"1px solid #dddddd", borderRadius:12, overflow:"hidden" }}>
          {loading ? (
            <div style={{ padding:48, textAlign:"center", color:"#aaaaaa", fontSize:14 }}>
              Loading bookings…
            </div>
          ) : error ? (
            <div style={{ padding:48, textAlign:"center" }}>
              <div style={{ fontSize:14, color:"#dc2626", marginBottom:12 }}>{error}</div>
              <button onClick={load} style={{ fontSize:13, padding:"8px 18px", borderRadius:9,
                border:"1.5px solid #dddddd", background:"#ffffff", color:"#555555",
                fontWeight:600, cursor:"pointer" }}>Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:48, textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
              <div style={{ fontSize:15, color:"#aaaaaa", fontWeight:600 }}>No bookings found</div>
            </div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
              <colgroup>
                <col style={{ width:"22%" }} />
                <col style={{ width:"36%" }} />
                <col style={{ width:"24%" }} />
                <col style={{ width:"18%" }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom:"1px solid #eeeeee", background:"#f9f9f9" }}>
                  {["Facility","Purpose","Date & time","Status"].map((h) => (
                    <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11,
                      fontWeight:700, color:"#aaaaaa", textTransform:"uppercase", letterSpacing:"0.07em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <BookingRow key={b.id} booking={b}
                    isSelected={selected?.id === b.id}
                    onClick={(bk) => setSelected(selected?.id === bk.id ? null : bk)} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <DetailPanel
            booking={selected}
            onClose={() => setSelected(null)}
            onEdit={() => setEditTarget(selected)}
            onCancel={() => setCancelTarget(selected)}
          />
        )}
      </div>

      {!loading && !error && filtered.length > 0 && (
        <p style={{ fontSize:12, color:"#aaaaaa", marginTop:12, textAlign:"right" }}>
          Showing {filtered.length} of {bookings.length} bookings
        </p>
      )}

      {editTarget && (
        <EditModal booking={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />
      )}
      {cancelTarget && (
        <CancelModal booking={cancelTarget} onClose={() => setCancelTarget(null)} onConfirmed={handleSaved} />
      )}
    </div>
  );
}