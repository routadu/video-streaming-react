import React from 'react';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ value = 0, label, showPercentage = true, variant = 'default', animated = true }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={styles.wrapper}>
      {(label || showPercentage) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showPercentage && (
            <span className={styles.percentage}>{clampedValue}%</span>
          )}
        </div>
      )}
      <div className={styles.track}>
        <div
          className={[
            styles.fill,
            styles[variant],
            animated && clampedValue < 100 ? styles.animated : '',
          ].filter(Boolean).join(' ')}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
