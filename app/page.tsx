'use client';

import { useState } from 'react';
import type { ValidationCategory } from '@/lib/types';
import { validationCategories } from '@/lib/validationRules';
import styles from '@/components/Validator.module.css';

const rulesPreview: Record<ValidationCategory, string[]> = {
  'Technical checks': [
    '101 - Report filename extension must be zip',
    '102 - SFTP report file size must not exceed 10GB',
    '103 - File contains mandatory worksheet tabs'
  ],
  'DPM Technical checks': [
    '201 - Template code is provided',
    '202 - DPM version follows expected format',
    '203 - Data point code is present'
  ],
  'DPM Business validation rules': [
    '301 - Service type is mandatory',
    '302 - Criticality value is valid',
    '303 - Termination date is after start date'
  ],
  'LEI-EUID checks': [
    '401 - LEI structure check',
    '402 - EUID structure check',
    '403 - At least one of LEI or EUID is present'
  ]
};

const defaultTab: ValidationCategory = 'Technical checks';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ValidationCategory>(defaultTab);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  if (!hasStarted) {
    return (
      <main className={styles.appShell}>
        <section className={styles.sketchCard}>
          <h1 className={styles.sketchTitle}>DORA Register of Information Validator</h1>
          <p className={styles.sketchSubtitle}>
            A calm, focused workspace for quickly validating your RoI files. Upload a report,
            review categories, and run checks with zero clutter.
          </p>

          <label className={styles.uploadSketchBox}>
            <input
              type="file"
              accept=".xlsx,.xls,.zip"
              onChange={(event) =>
                setSelectedFileName(event.target.files?.[0]?.name ?? null)
              }
            />
            <span className={styles.uploadText}>
              <span className={styles.uploadCaption}>Drop your report or click to browse</span>
              <span className={styles.uploadHint}>Accepted formats: .xlsx, .xls, .zip</span>
            </span>
          </label>

          <p className={styles.fileHint}>{selectedFileName ?? 'No file selected yet'}</p>

          <button
            type="button"
            className={styles.startButton}
            onClick={() => setHasStarted(true)}
            disabled={!selectedFileName}
          >
            Start validation
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.appShell}>
      <section className={styles.sketchCard}>
        <div className={styles.topBar}>
          <p className={styles.selectedFile}>Working file: {selectedFileName}</p>
          <button type="button" className={styles.resetButton} onClick={() => setHasStarted(false)}>
            Upload another file
          </button>
        </div>

        <div className={styles.tabRow}>
          {validationCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={`${styles.sketchTab} ${
                activeTab === category ? styles.sketchTabActive : ''
              }`}
              onClick={() => setActiveTab(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.panelLayout}>
          <div className={styles.rulesArea}>
            {rulesPreview[activeTab].map((rule) => (
              <p key={rule} className={styles.ruleCard}>
                {rule}
              </p>
            ))}
          </div>

          <div className={styles.controlsArea}>
            <p className={styles.runAllLabel}>Current result</p>
            <p className={styles.statusValue}>PASS</p>
            <p className={styles.statusHint}>All previewed checks are currently expected to pass.</p>
            <div className={styles.runControls}>
              <button type="button" className={styles.primaryAction}>
                Run checks
              </button>
              <button type="button" className={styles.secondaryAction}>
                Stop
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
