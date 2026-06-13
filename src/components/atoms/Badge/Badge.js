import React from 'react';
import styles from './Badge.module.css';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  return (
    <span
      className={[
        styles.badge,
        styles[variant],
        styles[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
};

export default Badge;
