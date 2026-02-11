'use client';

import type { ValidationCategory, ValidationResult } from '@/lib/types';
import { validationCategories } from '@/lib/validationRules';
import styles from './Validator.module.css';

type ValidationTabsProps = {
  activeTab: ValidationCategory;
  onChange: (category: ValidationCategory) => void;
  results: Partial<Record<ValidationCategory, ValidationResult>>;
};

export function ValidationTabs({ activeTab, onChange, results }: ValidationTabsProps) {
  return (
    <nav className={styles.tabs} aria-label="Validation categories">
      {validationCategories.map((category) => {
        const result = results[category];
        const issueCount = result?.issues.length ?? 0;
        return (
          <button
            key={category}
            className={`${styles.tab} ${activeTab === category ? styles.tabActive : ''}`}
            onClick={() => onChange(category)}
            type="button"
          >
            <span>{category}</span>
            <small>{issueCount === 0 ? 'No issues' : `${issueCount} issue(s)`}</small>
          </button>
        );
      })}
    </nav>
  );
}
