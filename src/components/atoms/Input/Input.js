import React, { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  error,
  hint,
  hintSuccess,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  id,
  ...rest
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={[styles.wrapper, fullWidth ? styles.fullWidth : '', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={[styles.inputWrapper, error ? styles.hasError : hintSuccess ? styles.hasSuccess : ''].filter(Boolean).join(' ')}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={[
            styles.input,
            leftIcon ? styles.withLeftIcon : '',
            rightIcon ? styles.withRightIcon : '',
          ].filter(Boolean).join(' ')}
          {...rest}
        />
        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
      {hint && !error && !hintSuccess && <p className={styles.hintText}>{hint}</p>}
      {hintSuccess && !error && (
        <p className={styles.hintSuccess}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {hintSuccess}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
