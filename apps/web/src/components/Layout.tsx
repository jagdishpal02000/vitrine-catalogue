import { Link, Outlet } from 'react-router';
import { BRAND } from '../config';
import styles from './Layout.module.css';

/** The frame around every page: header with the brand, then the current page. */
export function Layout() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.bar}>
          <Link to="/" className={styles.brand}>
            {BRAND.name}
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        {BRAND.name} · {BRAND.tagline}
      </footer>
    </>
  );
}
