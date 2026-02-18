'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getReservationById, Reservation } from '@/utils/storage';

function StatusContent() {
    const searchParams = useSearchParams();
    const urlId = searchParams.get('id');
    const [bookingId, setBookingId] = useState('');
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const checkStatus = async (id: string) => {
        if (!id.trim()) return;

        setLoading(true);
        setError('');
        setReservation(null);
        setSearched(false);

        try {
            const res = await getReservationById(id.trim());
            setReservation(res);
            setSearched(true);
        } catch (err) {
            setError('Failed to fetch reservation. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (urlId) {
            setBookingId(urlId);
            checkStatus(urlId);
        }
    }, [urlId]);

    const handleCheckStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        checkStatus(bookingId);
    };

    return (
        <main>
            <Navbar />
            <div className="container mx-auto px-4 py-8" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-panel w-full max-w-md p-8 rounded-xl">
                    <h1 className="text-2xl font-bold mb-6 text-center">Check Booking Status</h1>

                    <form onSubmit={handleCheckStatus} className="mb-8">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2 opacity-80">Booking ID</label>
                            <input
                                type="text"
                                value={bookingId}
                                onChange={(e) => setBookingId(e.target.value)}
                                placeholder="e.g. 7x912z..."
                                className="w-full p-3 rounded bg-white/5 border border-white/10 text-white focus:border-primary focus:outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? 'Checking...' : 'Check Status'}
                        </button>
                    </form>

                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded text-red-200 text-center mb-4">
                            {error}
                        </div>
                    )}

                    {searched && !reservation && !error && (
                        <div className="text-center text-gray-400">
                            No reservation found with that ID.
                        </div>
                    )}

                    {reservation && (
                        <div className="animate-fade-in border-t border-white/10 pt-6">
                            <div className="text-center mb-6">
                                <div className="text-sm opacity-60 mb-1">Status</div>
                                <div className={`text-3xl font-bold ${reservation.status === 'confirmed' ? 'text-green-400' :
                                    reservation.status === 'rejected' ? 'text-red-400' :
                                        'text-yellow-400'
                                    }`}>
                                    {reservation.status.toUpperCase()}
                                </div>
                            </div>

                            <div className="space-y-3 text-sm opacity-80">
                                <div className="flex justify-between">
                                    <span>Date:</span>
                                    <span className="font-medium text-white">{reservation.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Time:</span>
                                    <span className="font-medium text-white">{reservation.time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Guest Name:</span>
                                    <span className="font-medium text-white">{reservation.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Party Size:</span>
                                    <span className="font-medium text-white">{reservation.partySize} pax</span>
                                </div>
                            </div>

                            {reservation.status === 'confirmed' && (
                                <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-200 text-xs text-center">
                                    We look forward to seeing you!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function StatusPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen text-white">Loading...</div>}>
            <StatusContent />
        </Suspense>
    );
}
