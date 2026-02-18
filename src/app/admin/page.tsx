'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Calendar from '@/components/Calendar';
import { getReservations, updateReservationStatus, Reservation, getBlockedDates, toggleDateBlock, updateReservation, deleteReservation } from '@/utils/storage';
import styles from './admin.module.css';

export default function AdminPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [blockedDates, setBlockedDates] = useState<string[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
    const [dateToBlock, setDateToBlock] = useState('');
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            const data = await getReservations();
            // Sort by date (newest first)
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setReservations(data);

            const blocked = await getBlockedDates();
            setBlockedDates(blocked);
        } catch (error) {
            console.error("Failed to refresh data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleStatusUpdate = async (id: string, status: Reservation['status']) => {
        await updateReservationStatus(id, status);
        await refreshData();
    };

    const handleToggleBlock = async (date: string) => {
        await toggleDateBlock(date);
        await refreshData();
    };


    const handleApplyBulkToggling = async () => {
        if (selectedDates.length === 0) return;

        // Process sequentially to avoid race conditions in this simple implementation
        for (const date of selectedDates) {
            await toggleDateBlock(date);
        }

        setSelectedDates([]);
        await refreshData();
    };

    const handleEditClick = (res: Reservation) => {
        setEditingReservation(res);
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingReservation) {
            await updateReservation(editingReservation);
            setEditingReservation(null);
            await refreshData();
        }
    };

    const handleDeleteClick = async (id: string) => {
        if (confirm('Are you sure you want to delete this reservation? This action cannot be undone.')) {
            await deleteReservation(id);
            await refreshData();
        }
    };

    const filteredReservations = reservations.filter(r => {
        const matchesStatus = filter === 'all' || r.status === filter;
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.phone.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const stats = {
        total: reservations.length,
        pending: reservations.filter(r => r.status === 'pending').length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
    };

    if (loading && reservations.length === 0) {
        return (
            <main>
                <Navbar />
                <div className="flex justify-center items-center h-screen">
                    <div className="text-xl">Loading...</div>
                </div>
            </main>
        );
    }

    return (
        <main>
            <Navbar />
            <div className={styles.container}>
                <div className="container">
                    <div className={styles.header}>
                        <h1 className={styles.title}>Staff Dashboard</h1>
                        <button className="btn btn-secondary" onClick={refreshData}>
                            Refresh Data
                        </button>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.pending}</div>
                            <div className={styles.statLabel}>Pending Requests</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.confirmed}</div>
                            <div className={styles.statLabel}>Confirmed Booking</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats.total}</div>
                            <div className={styles.statLabel}>Total Reservations</div>
                        </div>
                    </div>

                    <div className={styles.section} style={{ marginBottom: '2rem' }}>
                        <div className={styles.sectionTitle}>
                            <span>Availability Management</span>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <button
                                    className={`btn ${showCalendar ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setShowCalendar(!showCalendar)}
                                >
                                    {showCalendar ? 'Close Calendar' : 'Toggle Block'}
                                </button>
                            </div>

                            {showCalendar ? (
                                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                    <p className="text-secondary text-center">Select multiple dates and toggle their status to prevent/allow new reservations.</p>
                                    <Calendar
                                        mode="multiple"
                                        selectedDates={selectedDates}
                                        onSelectDates={setSelectedDates}
                                        blockedDates={blockedDates}
                                    />

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleApplyBulkToggling}
                                            disabled={selectedDates.length === 0}
                                        >
                                            Toggle {selectedDates.length} Selected Date{selectedDates.length !== 1 ? 's' : ''}
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => setSelectedDates([])}
                                            disabled={selectedDates.length === 0}
                                        >
                                            Clear Selection
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-secondary">Click the button above to manage dates and blocked availability.</p>
                            )}

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                                {blockedDates.length === 0 ? (
                                    <span className="text-muted text-sm">No dates currently blocked.</span>
                                ) : (
                                    blockedDates.map(date => (
                                        <div key={date} style={{
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.9rem'
                                        }}>
                                            <span>{date}</span>
                                            <button
                                                onClick={() => handleToggleBlock(date)}
                                                style={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                                                title="Unblock"
                                            >✕</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>
                            <span>Reservations</span>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Search guest name..."
                                    className={styles.searchBar}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => setFilter('all')}
                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => setFilter('pending')}
                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                    >
                                        Pending
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Date & Time</th>
                                        <th>Guest</th>
                                        <th>Party</th>
                                        <th>Contact</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReservations.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                                No reservations found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReservations.map(res => (
                                            <tr key={res.id}>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${res.status === 'pending' ? styles.statusPending :
                                                        res.status === 'confirmed' ? styles.statusConfirmed :
                                                            styles.statusRejected
                                                        }`}>
                                                        {res.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{res.date}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{res.time}</div>
                                                </td>
                                                <td>{res.name}</td>
                                                <td>{res.partySize} pax</td>
                                                <td>
                                                    <div style={{ fontSize: '0.9rem' }}>{res.phone}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{res.email}</div>
                                                </td>
                                                <td>
                                                    <div className={styles.actions}>
                                                        <button
                                                            className={styles.actionBtn}
                                                            onClick={() => handleEditClick(res)}
                                                            title="Edit"
                                                            style={{ color: 'var(--text-primary)', borderColor: 'var(--text-secondary)' }}
                                                        >
                                                            ✎
                                                        </button>
                                                        <button
                                                            className={styles.actionBtn}
                                                            onClick={() => handleDeleteClick(res.id)}
                                                            title="Delete"
                                                            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                                        >
                                                            🗑
                                                        </button>
                                                        {res.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    className={`${styles.actionBtn} ${styles.approveBtn}`}
                                                                    onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                                                                    title="Approve"
                                                                >
                                                                    ✓
                                                                </button>
                                                                <button
                                                                    className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                                                    onClick={() => handleStatusUpdate(res.id, 'rejected')}
                                                                    title="Reject"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {editingReservation && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', borderRadius: '12px' }}>
                        <h2 className={styles.sectionTitle}>Edit Reservation</h2>
                        <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="text-sm text-secondary block mb-1">Name</label>
                                <input
                                    className="w-full p-2 rounded bg-black/30 border border-white/10 text-white"
                                    value={editingReservation.name}
                                    onChange={e => setEditingReservation({ ...editingReservation, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="text-sm text-secondary block mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 rounded bg-black/30 border border-white/10 text-white"
                                        value={editingReservation.date}
                                        onChange={e => setEditingReservation({ ...editingReservation, date: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-secondary block mb-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full p-2 rounded bg-black/30 border border-white/10 text-white"
                                        value={editingReservation.time}
                                        onChange={e => setEditingReservation({ ...editingReservation, time: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="text-sm text-secondary block mb-1">Phone</label>
                                    <input
                                        className="w-full p-2 rounded bg-black/30 border border-white/10 text-white"
                                        value={editingReservation.phone}
                                        onChange={e => setEditingReservation({ ...editingReservation, phone: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-secondary block mb-1">Party Size</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 rounded bg-black/30 border border-white/10 text-white"
                                        value={editingReservation.partySize}
                                        onChange={e => setEditingReservation({ ...editingReservation, partySize: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-secondary block mb-1">Email</label>
                                <input
                                    className="w-full p-2 rounded bg-black/30 border border-white/10 text-white"
                                    value={editingReservation.email}
                                    onChange={e => setEditingReservation({ ...editingReservation, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setEditingReservation(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
