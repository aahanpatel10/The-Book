import { useState } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContent}`}>
                <Link href="/" className={styles.logo}>
                    The <span>Books</span>
                </Link>

                <div className={`${styles.navLinks} ${isOpen ? styles.navLinksOpen : ''}`}>
                    <Link href="/" className={styles.link} onClick={() => setIsOpen(false)}>Home</Link>
                    <Link href="/menu" className={styles.link} onClick={() => setIsOpen(false)}>Menu</Link>
                    <Link href="/reservations/status" className={styles.link} onClick={() => setIsOpen(false)}>Check Status</Link>
                    <Link href="/reservations" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                        Book a Table
                    </Link>
                </div>

                <button
                    className={styles.mobileMenuBtn}
                    onClick={toggleMenu}
                    aria-label={isOpen ? "Close Menu" : "Open Menu"}
                >
                    {isOpen ? '✕' : '☰'}
                </button>
            </div>
        </nav>
    );
}
