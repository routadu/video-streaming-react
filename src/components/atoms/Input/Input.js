import React, { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  error,
  hint,
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
      <div className={[styles.inputWrapper, error ? styles.hasError : ''].filter(Boolean).join(' ')}>
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
      {hint && !error && <p className={styles.hintText}>{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
