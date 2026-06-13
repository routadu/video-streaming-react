import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/" style={{ fontSize: '1.5rem' }}>StreamVault</Link>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px' }}>
        <Link to="/">Home</Link>
        
        {isLoggedIn ? (
          <>
            <Link to="/upload" style={{ color: 'var(--text-secondary)' }}>Upload Video</Link>
            <button 
              onClick={handleLogout} 
              style={{ background: 'transparent', color: '#ff4d4d', padding: 0, border: 'none' }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;