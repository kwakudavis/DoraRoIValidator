export type UploadData = {
  fileName: string;
  sheetName: string;
  columns: string[];
  rows: Array<Record<string, string>>;
};

export type RuleSeverity = 'error' | 'warning';

export type ValidationIssue = {
  ruleId: string;
  ruleName: string;
  severity: RuleSeverity;
  message: string;
  rowIndexes: number[];
};

export type ValidationResult = {
  category: ValidationCategory;
  issues: ValidationIssue[];
  passedRules: number;
  totalRules: number;
};

export type ValidationRule = {
  id: string;
  name: string;
  severity: RuleSeverity;
  check: (rows: Array<Record<string, string>>) => number[];
  message: (count: number) => string;
};

export type ValidationCategory =
  | 'Technical checks'
  | 'DPM Technical checks'
  | 'DPM Business validation rules'
  | 'LEI-EUID checks';
