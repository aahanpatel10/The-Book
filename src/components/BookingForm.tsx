'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailableSlots, addReservation } from '@/utils/storage';
import styles from './BookingForm.module.css';

interface BookingFormProps {
    date: Date;
}

export default function BookingForm({ date }: BookingFormProps) {
    const router = useRouter();
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        partySize: 2
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastBookingId, setLastBookingId] = useState<string | null>(null);

    useEffect(() => {
        // Reset selection when date changes
        setSelectedSlot(null);
        setIsSuccess(false);

        // Fetch slots
        const fetchSlots = async () => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const available = await getAvailableSlots(dateStr);
            setSlots(available);
        };
        fetchSlots();
    }, [date]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;

        setIsSubmitting(true);

        // Simulate network delay
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        try {
            const newRes = await addReservation({
                date: dateStr,
                time: selectedSlot,
                partySize: formData.partySize,
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });

            // Store ID for success message
            setLastBookingId(newRes.id);

            setIsSubmitting(false);
            setIsSuccess(true);

            // Automatically redirect to status page after a short delay or immediately
            // Redirecting after 2 seconds to allow success state to be visible briefly
            setTimeout(() => {
                router.push(`/reservations/status?id=${newRes.id}`);
            }, 1500);
        } catch (error) {
            console.error("Booking failed", error);
            setIsSubmitting(false);
            alert("Failed to make reservation. Please try again.");
        }
    };

    if (isSuccess) {
        return (
            <div className={styles.successMessage}>
                <h3 className="text-xl font-bold mb-2">Reservation Requested!</h3>
                <p>Thank you, {formData.name}.</p>
                <div className="bg-white/10 p-4 rounded-lg my-4 text-center">
                    <p className="text-sm opacity-80 mb-1">Your Booking ID:</p>
                    <p className="text-2xl font-mono font-bold text-primary">{lastBookingId}</p>
                </div>
                <p>We have received your request for {date.toLocaleDateString()} at {selectedSlot}.</p>
                <p className="text-sm mt-4 opacity-80">
                    You can check your status at any time on the <a href="/reservations/status" className="text-primary underline">Status Page</a> using your Booking ID.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn btn-secondary mt-6"
                >
                    Make Another Booking
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>

            <form onSubmit={handleSubmit}>
                <div className={styles.sectionTitle}>Select Time</div>
                <div className={styles.slotsGrid}>
                    {slots.map(slot => (
                        <button
                            key={slot}
                            type="button"
                            className={`${styles.slotBtn} ${selectedSlot === slot ? styles.selectedSlot : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                        >
                            {slot}
                        </button>
                    ))}
                </div>

                {selectedSlot && (
                    <div className="animate-fade-in">
                        <div className={styles.sectionTitle}>Your Details</div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Name</label>
                            <input
                                required
                                type="text"
                                className={styles.input}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className={styles.grid2} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Phone</label>
                                <input
                                    required
                                    type="tel"
                                    className={styles.input}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Party Size</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="12"
                                    className={styles.input}
                                    value={formData.partySize}
                                    onChange={e => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email (Optional)</label>
                            <input
                                type="email"
                                className={styles.input}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary ${styles.submitBtn}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
