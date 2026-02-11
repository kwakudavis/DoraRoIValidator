'use client';

import type { ValidationCategory, ValidationResult } from '@/lib/types';
import styles from './Validator.module.css';

type ValidationPanelProps = {
  category: ValidationCategory;
  result?: ValidationResult;
};

export function ValidationPanel({ category, result }: ValidationPanelProps) {
  if (!result) {
    return (
      <section className={styles.card}>
        <h3>{category}</h3>
        <p>Run checks to see validation findings for this category.</p>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.resultHeading}>
        <div>
          <h3>{category}</h3>
          <p>
            Rules passed: {result.passedRules}/{result.totalRules}
          </p>
        </div>
      </div>

      {result.issues.length === 0 ? (
        <p className={styles.goodMessage}>No findings detected for this category.</p>
      ) : (
        <ul className={styles.issueList}>
          {result.issues.map((issue) => (
            <li key={issue.ruleId} className={styles.issueItem}>
              <strong>
                {issue.ruleId} — {issue.ruleName}
              </strong>
              <p>{issue.message}</p>
              <small>
                Severity: {issue.severity.toUpperCase()} | Rows: {issue.rowIndexes.join(', ')}
              </small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
