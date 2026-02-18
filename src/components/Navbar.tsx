import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContent}`}>
                <Link href="/" className={styles.logo}>
                    The <span>Books</span>
                </Link>

                <div className={styles.navLinks}>
                    <Link href="/" className={styles.link}>Home</Link>
                    <Link href="/menu" className={styles.link}>Menu</Link>
                    <Link href="/reservations/status" className={styles.link}>Check Status</Link>
                    <Link href="/reservations" className="btn btn-primary">
                        Book a Table
                    </Link>
                </div>

                <button className={styles.mobileMenuBtn} aria-label="Menu">
                    ☰
                </button>
            </div>
        </nav>
    );
}
