import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc, query, orderBy } from 'firebase/firestore';

export interface Reservation {
    id: string;
    date: string; // ISO date string (YYYY-MM-DD)
    time: string;
    partySize: number;
    name: string;
    email: string;
    phone: string;
    status: 'pending' | 'confirmed' | 'rejected';
    createdAt: string;
}

const RESERVATIONS_COLLECTION = 'reservations';
const SETTINGS_COLLECTION = 'settings';
const BLOCKED_DATES_DOC = 'blockedDates';

export const getReservations = async (): Promise<Reservation[]> => {
    try {
        const q = query(collection(db, RESERVATIONS_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Reservation));
    } catch (error) {
        console.error("Error fetching reservations:", error);
        return [];
    }
};

export const getReservationById = async (id: string): Promise<Reservation | null> => {
    try {
        const docRef = doc(db, RESERVATIONS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Reservation;
        }
        return null;
    } catch (error) {
        console.error("Error fetching reservation:", error);
        return null;
    }
};

export const getBlockedDates = async (): Promise<string[]> => {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, BLOCKED_DATES_DOC);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().dates || [];
        }
        return [];
    } catch (error) {
        console.error("Error fetching blocked dates:", error);
        return [];
    }
};

export const toggleDateBlock = async (date: string): Promise<string[]> => {
    try {
        const currentBlocked = await getBlockedDates();
        const index = currentBlocked.indexOf(date);
        let newBlocked;

        if (index >= 0) {
            newBlocked = currentBlocked.filter(d => d !== date);
        } else {
            newBlocked = [...currentBlocked, date];
        }

        const docRef = doc(db, SETTINGS_COLLECTION, BLOCKED_DATES_DOC);
        await setDoc(docRef, { dates: newBlocked });
        return newBlocked;
    } catch (error) {
        console.error("Error toggling date block:", error);
        return [];
    }
};

export const addReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>): Promise<Reservation> => {
    const newReservationData = {
        ...reservation,
        createdAt: new Date().toISOString(),
        status: 'pending',
    };

    try {
        const docRef = await addDoc(collection(db, RESERVATIONS_COLLECTION), newReservationData);
        return {
            id: docRef.id,
            ...newReservationData
        } as Reservation;
    } catch (error) {
        console.error("Error adding reservation:", error);
        throw error;
    }
};

export const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    try {
        const docRef = doc(db, RESERVATIONS_COLLECTION, id);
        await updateDoc(docRef, { status });
    } catch (error) {
        console.error("Error updating reservation status:", error);
        throw error;
    }
};

export const updateReservation = async (updatedRes: Reservation) => {
    try {
        const { id, ...data } = updatedRes;
        const docRef = doc(db, RESERVATIONS_COLLECTION, id);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error("Error updating reservation:", error);
        throw error;
    }
};

export const deleteReservation = async (id: string) => {
    try {
        const docRef = doc(db, RESERVATIONS_COLLECTION, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting reservation:", error);
        throw error;
    }
};

export const getAvailableSlots = async (date: string): Promise<string[]> => {
    // Check if date is blocked
    const blocked = await getBlockedDates();
    if (blocked.includes(date)) return [];

    // Mock availability logic
    // In a real app, this would check existing reservations against capacity
    const allSlots = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

    // Randomly remove some slots to simulate busyness (deterministic based on date string)
    const seed = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return allSlots.filter((_, i) => (seed + i) % 3 !== 0);
};
