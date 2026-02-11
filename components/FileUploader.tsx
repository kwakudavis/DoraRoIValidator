'use client';

import { useRef } from 'react';
import styles from './Validator.module.css';

type FileUploaderProps = {
  isLoading: boolean;
  onFileSelected: (file: File) => void;
};

export function FileUploader({ isLoading, onFileSelected }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>1. Upload register of information file</h2>
        <p>
          Upload an Excel file (.xlsx/.xls). The validator reads the first sheet and
          applies selected checks.
        </p>
      </div>
      <div className={styles.uploadRow}>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) {
              onFileSelected(selected);
              event.target.value = '';
            }
          }}
          disabled={isLoading}
        />
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
        >
          {isLoading ? 'Parsing...' : 'Choose file'}
        </button>
      </div>
    </section>
  );
}
