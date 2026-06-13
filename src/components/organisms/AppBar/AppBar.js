import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SearchBar from '../../molecules/SearchBar/SearchBar';
import Button from '../../atoms/Button/Button';
import styles from './AppBar.module.css';

const StreamVaultLogo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#FF0000" />
    <path d="M11 9L23 16L11 23V9Z" fill="white" />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MyPageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AppBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (query) => {
    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const getInitials = () => {
    if (user?.firstName) {
      return (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase();
    }
    return 'U';
  };

  const searchQuery = new URLSearchParams(location.search).get('search') || '';

  return (
    <header className={styles.appBar}>
      <div className={styles.inner}>
        {/* Left: Logo */}
        <Link to="/" className={styles.brand} aria-label="StreamVault Home">
          <StreamVaultLogo />
          <span className={styles.brandName}>StreamVault</span>
        </Link>

        {/* Center: Search */}
        <div className={styles.searchWrap}>
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
        </div>

        {/* Right: Actions */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <Link to="/upload" className={styles.uploadLink} title="Upload Video">
                <Button variant="secondary" size="sm">
                  <UploadIcon />
                  <span className={styles.uploadText}>Upload</span>
                </Button>
              </Link>

              {/* User Menu */}
              <div className={styles.userMenuWrap}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-label="User menu"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className={styles.avatarImg} />
                  ) : (
                    <span className={styles.avatarInitials}>{getInitials()}</span>
                  )}
                </button>

                {menuOpen && (
                  <>
                    <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />
                    <div className={styles.dropdown} role="menu">
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownAvatar}>
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="avatar" className={styles.dropdownAvatarImg} />
                          ) : (
                            <span className={styles.dropdownAvatarInitials}>{getInitials()}</span>
                          )}
                        </div>
                        <div className={styles.dropdownUserInfo}>
                          <span className={styles.dropdownName}>
                            {user?.firstName} {user?.lastName}
                          </span>
                          <span className={styles.dropdownEmail}>@{user?.username}</span>
                        </div>
                      </div>
                      <div className={styles.dropdownDivider} />
                      <button
                        className={styles.dropdownItem}
                        onClick={() => {
                          setMenuOpen(false);
                          navigate(`/user/${user?.username}`);
                        }}
                        role="menuitem"
                      >
                        <MyPageIcon />
                        My Page
                      </button>
                      <button
                        className={styles.dropdownItem}
                        onClick={handleLogout}
                        role="menuitem"
                      >
                        <LogoutIcon />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  <UserIcon />
                  <span>Register</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppBar;
