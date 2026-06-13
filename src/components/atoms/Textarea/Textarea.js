import React, { forwardRef } from 'react';
import styles from './Textarea.module.css';

const Textarea = forwardRef(({
  label,
  error,
  hint,
  fullWidth = true,
  rows = 4,
  className = '',
  id,
  ...rest
}, ref) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={[styles.wrapper, fullWidth ? styles.fullWidth : '', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={[styles.textarea, error ? styles.hasError : ''].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && <p className={styles.errorText}>{error}</p>}
      {hint && !error && <p className={styles.hintText}>{hint}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
