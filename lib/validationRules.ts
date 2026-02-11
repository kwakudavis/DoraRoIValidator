import type {
  ValidationCategory,
  ValidationIssue,
  ValidationResult,
  ValidationRule
} from './types';

const getField = (row: Record<string, string>, candidates: string[]): string => {
  for (const candidate of candidates) {
    const hit = Object.keys(row).find(
      (key) => key.toLowerCase() === candidate.toLowerCase()
    );
    if (hit) {
      return row[hit] ?? '';
    }
  }
  return '';
};

const requiredFieldRule = (
  id: string,
  name: string,
  fields: string[],
  severity: 'error' | 'warning' = 'error'
): ValidationRule => ({
  id,
  name,
  severity,
  check: (rows) =>
    rows
      .map((row, index) => {
        const value = getField(row, fields);
        return value ? -1 : index;
      })
      .filter((idx) => idx >= 0),
  message: (count) => `${count} row(s) are missing ${fields.join(' / ')}.`
});

const regexRule = (
  id: string,
  name: string,
  fields: string[],
  regex: RegExp,
  message: string
): ValidationRule => ({
  id,
  name,
  severity: 'error',
  check: (rows) =>
    rows
      .map((row, index) => {
        const value = getField(row, fields);
        if (!value) {
          return -1;
        }
        return regex.test(value) ? -1 : index;
      })
      .filter((idx) => idx >= 0),
  message: (count) => `${count} row(s) failed rule: ${message}`
});

const rulesByCategory: Record<ValidationCategory, ValidationRule[]> = {
  'Technical checks': [
    requiredFieldRule('TECH-1', 'Unique identifier is mandatory', ['Record ID']),
    requiredFieldRule('TECH-2', 'Entity name is mandatory', ['Entity Name']),
    regexRule(
      'TECH-3',
      'Reference date format',
      ['Reference Date'],
      /^\d{4}-\d{2}-\d{2}$/,
      'Reference Date must be formatted as YYYY-MM-DD'
    )
  ],
  'DPM Technical checks': [
    requiredFieldRule('DPM-T-1', 'Template code is mandatory', ['Template Code']),
    regexRule(
      'DPM-T-2',
      'Data point model version check',
      ['DPM Version'],
      /^\d{4}\.\d+$/,
      'DPM Version must follow YYYY.N format'
    ),
    requiredFieldRule(
      'DPM-T-3',
      'Data point code is mandatory',
      ['Data Point Code']
    )
  ],
  'DPM Business validation rules': [
    requiredFieldRule('DPM-B-1', 'Service type is mandatory', ['Service Type']),
    {
      id: 'DPM-B-2',
      name: 'Criticality rating must be Low/Medium/High',
      severity: 'error',
      check: (rows) =>
        rows
          .map((row, index) => {
            const value = getField(row, ['Criticality']);
            if (!value) {
              return -1;
            }
            return ['low', 'medium', 'high'].includes(value.toLowerCase())
              ? -1
              : index;
          })
          .filter((idx) => idx >= 0),
      message: (count) =>
        `${count} row(s) have an invalid Criticality value (expected Low/Medium/High).`
    },
    {
      id: 'DPM-B-3',
      name: 'Termination date cannot be before start date',
      severity: 'warning',
      check: (rows) =>
        rows
          .map((row, index) => {
            const start = getField(row, ['Start Date']);
            const end = getField(row, ['Termination Date']);
            if (!start || !end) {
              return -1;
            }
            return new Date(end) >= new Date(start) ? -1 : index;
          })
          .filter((idx) => idx >= 0),
      message: (count) =>
        `${count} row(s) have Termination Date earlier than Start Date.`
    }
  ],
  'LEI-EUID checks': [
    regexRule(
      'LEI-1',
      'LEI structure check',
      ['LEI'],
      /^[A-Z0-9]{20}$/,
      'LEI must be a 20-character alphanumeric code'
    ),
    regexRule(
      'LEI-2',
      'EUID structure check',
      ['EUID'],
      /^[A-Z]{2}-[A-Z0-9]{2,32}$/,
      'EUID must follow CC-IDENTIFIER format'
    ),
    {
      id: 'LEI-3',
      name: 'At least one of LEI or EUID must be present',
      severity: 'error',
      check: (rows) =>
        rows
          .map((row, index) => {
            const lei = getField(row, ['LEI']);
            const euid = getField(row, ['EUID']);
            return lei || euid ? -1 : index;
          })
          .filter((idx) => idx >= 0),
      message: (count) => `${count} row(s) are missing both LEI and EUID values.`
    }
  ]
};

export const validationCategories = Object.keys(rulesByCategory) as ValidationCategory[];

export const runValidationByCategory = (
  category: ValidationCategory,
  rows: Array<Record<string, string>>
): ValidationResult => {
  const rules = rulesByCategory[category];
  const issues: ValidationIssue[] = [];
  let passedRules = 0;

  rules.forEach((rule) => {
    const failedIndexes = rule.check(rows);
    if (failedIndexes.length === 0) {
      passedRules += 1;
      return;
    }

    issues.push({
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: rule.message(failedIndexes.length),
      rowIndexes: failedIndexes.map((idx) => idx + 2)
    });
  });

  return {
    category,
    issues,
    passedRules,
    totalRules: rules.length
  };
};
