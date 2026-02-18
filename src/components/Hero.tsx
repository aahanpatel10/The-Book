import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.overlay} />
            <div className={styles.content}>
                <span className={styles.eyebrow}>Est. 2024</span>
                <h1 className={styles.headline}>
                    Culinary Excellence <br /> Redefined.
                </h1>
                <p className={styles.subheadline}>
                    Experience an unforgettable journey of flavors at The Books.
                    Where tradition meets modern luxury.
                </p>
                <div className={styles.actions}>
                    <Link href="/reservations" className="btn btn-primary">
                        Reserve a Table
                    </Link>
                    <Link href="/menu" className="btn btn-secondary">
                        View Menu
                    </Link>
                </div>
            </div>
        </section>
    );
}
