'use client';

import { useState } from 'react';
import styles from './Calendar.module.css';

interface CalendarProps {
    onSelectDate?: (date: Date) => void;
    onSelectDates?: (dates: string[]) => void;
    selectedDate?: Date | null;
    selectedDates?: string[]; // Used for multi-select mode
    blockedDates?: string[];
    mode?: 'single' | 'multiple';
}

export default function Calendar({
    onSelectDate,
    onSelectDates,
    selectedDate,
    selectedDates = [],
    blockedDates = [],
    mode = 'single'
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const formatDate = (day: number) => {
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${month}-${d}`;
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = formatDate(day);

        if (mode === 'multiple' && onSelectDates) {
            let newSelected;
            if (selectedDates.includes(dateStr)) {
                newSelected = selectedDates.filter(d => d !== dateStr);
            } else {
                newSelected = [...selectedDates, dateStr];
            }
            onSelectDates(newSelected);
        } else if (onSelectDate) {
            onSelectDate(newDate);
        }
    };

    const isSelected = (day: number) => {
        const dateStr = formatDate(day);
        if (mode === 'multiple') {
            return selectedDates.includes(dateStr);
        }
        if (!selectedDate) return false;
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear()
        );
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === currentMonth.getMonth() &&
            today.getFullYear() === currentMonth.getFullYear()
        );
    };

    // Simple verification to disable past dates
    const isPast = (day: number) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return checkDate < today;
    }

    // Check if date is blocked by admin
    const isBlocked = (day: number) => {
        const dateStr = formatDate(day);
        return blockedDates.includes(dateStr);
    }

    const renderDays = () => {
        const days = [];
        // Empty cells for padding
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className={styles.empty}></div>);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const past = isPast(i);
            const blocked = isBlocked(i);
            // In multiple mode (admin), we don't disable future dates, only past ones if needed.
            // But actually for admin we might want to see and toggle even past dates? 
            // Letting admin toggle anything for now.
            const isDisabled = mode === 'single' ? (past || blocked) : false;

            days.push(
                <button
                    key={i}
                    className={`
                    ${styles.dayBtn} 
                    ${isSelected(i) ? styles.selected : ''} 
                    ${isToday(i) ? styles.today : ''}
                    ${blocked ? styles.blocked : ''}
                    ${isDisabled ? styles.disabled : ''}
                `}
                    onClick={() => !isDisabled && handleDateClick(i)}
                    disabled={isDisabled}
                    title={blocked ? "Blocked Date" : ""}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.header}>
                <button onClick={handlePrevMonth} className={styles.navBtn}>&lt;</button>
                <span className={styles.monthTitle}>
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleNextMonth} className={styles.navBtn}>&gt;</button>
            </div>
            <div className={styles.grid}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className={styles.dayLabel}>{day}</div>
                ))}
                {renderDays()}
            </div>
        </div>
    );
}

