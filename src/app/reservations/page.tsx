'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Calendar from '@/components/Calendar';
import BookingForm from '@/components/BookingForm';
import { getBlockedDates } from '@/utils/storage';
import styles from './page.module.css';

export default function ReservationsPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [blockedDates, setBlockedDates] = useState<string[]>([]);

    useEffect(() => {
        const fetchBlockedDates = async () => {
            const dates = await getBlockedDates();
            setBlockedDates(dates);
        };
        fetchBlockedDates();
    }, []);

    return (
        <main>
            <Navbar />
            <div className={styles.container}>
                <div className={`container ${styles.content}`}>
                    <h1 className={styles.title}>Make a Reservation</h1>
                    <p className={styles.subtitle}>Select a date to view available tables.</p>

                    <div className={styles.grid}>
                        <div className={styles.calendarSection}>
                            <Calendar
                                selectedDate={selectedDate}
                                onSelectDate={setSelectedDate}
                                blockedDates={blockedDates}
                            />
                        </div>

                        <div className={styles.formSection}>
                            {selectedDate ? (
                                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
                                    <BookingForm date={selectedDate} />
                                </div>
                            ) : (
                                <div className={styles.placeholder}>
                                    <p>Please select a date from the calendar to view available times.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
