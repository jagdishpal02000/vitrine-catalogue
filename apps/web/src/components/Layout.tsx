import { Link, NavLink, Outlet } from 'react-router';
import { useCategories } from '../api/catalogue';
import { BRAND } from '../config';
import styles from './Layout.module.css';
import { SearchBar } from './SearchBar';

/** The frame around every page: brand, search and category links, then the current page. */
export function Layout() {
  // If categories fail to load, the navigation is simply empty; the page itself still works.
  const { data: categories = [] } = useCategories();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.bar}>
          <Link to="/" className={styles.brand}>
            {BRAND.name}
          </Link>
          <SearchBar />
        </div>

        <nav aria-label="Categories" className={styles.nav}>
          {categories.map((category) => (
            <NavLink
              key={category.slug}
              to={`/categories/${category.slug}`}
              className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
            >
              {category.name}
            </NavLink>
          ))}
        </nav>
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
