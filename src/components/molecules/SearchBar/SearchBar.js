import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SearchBar = ({ onSearch, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      if (onSearch) {
        onSearch(trimmed);
      } else {
        navigate(`/?search=${encodeURIComponent(trimmed)}`);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
    if (onSearch) onSearch('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={[styles.form, focused ? styles.focused : ''].filter(Boolean).join(' ')}
    >
      <button type="submit" className={styles.searchIconBtn} aria-label="Search" tabIndex={-1}>
        <SearchIcon />
      </button>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search videos..."
        className={styles.input}
        aria-label="Search videos"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearBtn}
          aria-label="Clear search"
        >
          <ClearIcon />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
