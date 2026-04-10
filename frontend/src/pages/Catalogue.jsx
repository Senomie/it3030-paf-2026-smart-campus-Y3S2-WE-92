import React from 'react';
import { Link } from 'react-router-dom';

const resources = [
    { id: 'Hall A — Lecture theatre', label: 'Hall A — Lecture theatre' },
    { id: 'Lab B — Computer lab', label: 'Lab B — Computer lab' },
    { id: 'Meeting room C', label: 'Meeting room C' },
    { id: 'Portable projector P12', label: 'Portable projector P12' },
];

const Catalogue = () => (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 20px' }}>
        <h1 style={{ marginBottom: 8 }}>Facilities &amp; assets</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Demo catalogue — pick a resource to book or report an issue.
        </p>
        <div style={{ display: 'grid', gap: 16 }}>
            {resources.map((r) => (
                <div key={r.id} className="premium-card" style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 700, marginBottom: 12 }}>{r.label}</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Link
                            to={`/book/${encodeURIComponent(r.id)}`}
                            style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                        >
                            Book
                        </Link>
                        <Link
                            to={`/report/${encodeURIComponent(r.id)}`}
                            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
                        >
                            Report issue
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default Catalogue;
