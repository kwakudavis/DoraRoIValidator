'use client';

import { useMemo, useState } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { ValidationPanel } from '@/components/ValidationPanel';
import { ValidationTabs } from '@/components/ValidationTabs';
import { parseWorkbook } from '@/lib/fileParser';
import type { UploadData, ValidationCategory, ValidationResult } from '@/lib/types';
import {
  runValidationByCategory,
  validationCategories
} from '@/lib/validationRules';
import styles from '@/components/Validator.module.css';

const defaultTab: ValidationCategory = 'Technical checks';

export default function HomePage() {
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [activeTab, setActiveTab] = useState<ValidationCategory>(defaultTab);
  const [results, setResults] = useState<Partial<Record<ValidationCategory, ValidationResult>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const resultValues = Object.values(results);
    if (resultValues.length === 0) {
      return null;
    }

    const issues = resultValues.reduce((count, result) => count + (result?.issues.length ?? 0), 0);
    const passed = resultValues.reduce((count, result) => count + (result?.passedRules ?? 0), 0);
    const total = resultValues.reduce((count, result) => count + (result?.totalRules ?? 0), 0);

    return { issues, passed, total };
  }, [results]);

  const runAllChecks = (rows: Array<Record<string, string>>) => {
    const nextResults: Partial<Record<ValidationCategory, ValidationResult>> = {};
    validationCategories.forEach((category) => {
      nextResults[category] = runValidationByCategory(category, rows);
    });
    setResults(nextResults);
  };

  return (
    <main>
      <header className={styles.pageHeader}>
        <h1>DORA Register of Information Validator</h1>
        <p>
          Upload a source file, then navigate validation tabs to review findings for
          Technical checks, DPM checks, business rules, and LEI-EUID checks.
        </p>
      </header>

      <FileUploader
        isLoading={isLoading}
        onFileSelected={async (file) => {
          setIsLoading(true);
          setError(null);

          try {
            const parsed = await parseWorkbook(file);
            setUploadData(parsed);
            runAllChecks(parsed.rows);
          } catch (uploadError) {
            setUploadData(null);
            setResults({});
            setError(
              uploadError instanceof Error
                ? uploadError.message
                : 'Unable to parse the file.'
            );
          } finally {
            setIsLoading(false);
          }
        }}
      />

      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      {uploadData ? (
        <>
          <section className={styles.card}>
            <h2>2. Validation overview</h2>
            <p>
              File: <strong>{uploadData.fileName}</strong> | Sheet:{' '}
              <strong>{uploadData.sheetName}</strong> | Rows loaded:{' '}
              <strong>{uploadData.rows.length}</strong>
            </p>
            {summary ? (
              <p>
                Rules passed: {summary.passed}/{summary.total} | Total findings:{' '}
                {summary.issues}
              </p>
            ) : null}
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => runAllChecks(uploadData.rows)}
            >
              Re-run all checks
            </button>
          </section>

          <ValidationTabs activeTab={activeTab} onChange={setActiveTab} results={results} />

          <ValidationPanel category={activeTab} result={results[activeTab]} />
        </>
      ) : (
        <section className={styles.card}>
          <h2>Next step</h2>
          <p>Upload an RoI workbook to activate all four validation sections.</p>
        </section>
      )}
    </main>
  );
}
