import { useState, type SubmitEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import styles from './SearchBar.module.css';

/** The search form in the header. Submitting (button or Enter) opens the results page for the term. */
export function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') ?? '');

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = term.trim();
    if (query) void navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form role="search" className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="search-term" className="visually-hidden">
        Search products
      </label>
      <input
        id="search-term"
        type="search"
        value={term}
        onChange={(event) => {
          setTerm(event.target.value);
        }}
        placeholder="Search products"
        maxLength={100}
        required
      />
      <button type="submit">Search</button>
    </form>
  );
}
