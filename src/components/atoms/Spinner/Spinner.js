import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ size = 'md', className = '' }) => {
  return (
    <span
      className={[styles.spinner, styles[size], className].filter(Boolean).join(' ')}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
