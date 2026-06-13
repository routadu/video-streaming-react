import React, { useRef } from 'react';
import styles from './FileUpload.module.css';

const FileUpload = ({
  accept,
  onChange,
  label = 'Choose file',
  hint,
  file,
  error,
  icon,
}) => {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && onChange) {
      onChange({ target: { files: [dropped] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={[styles.dropZone, error ? styles.hasError : '', file ? styles.hasFile : ''].filter(Boolean).join(' ')}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label={label}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onChange}
          className={styles.hiddenInput}
          aria-hidden="true"
        />
        <div className={styles.content}>
          <div className={styles.iconWrap}>
            {icon || (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
          </div>
          {file ? (
            <>
              <p className={styles.fileName}>{file.name}</p>
              <p className={styles.fileSize}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <p className={styles.label}>{label}</p>
              {hint && <p className={styles.hint}>{hint}</p>}
            </>
          )}
        </div>
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default FileUpload;
