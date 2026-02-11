import * as XLSX from 'xlsx';
import type { UploadData } from './types';

const normalizeCell = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
};

export const parseWorkbook = async (file: File): Promise<UploadData> => {
  const fileBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error('The uploaded workbook does not contain any sheet.');
  }

  const worksheet = workbook.Sheets[sheetName];
  const asRows = XLSX.utils.sheet_to_json<Array<unknown>>(worksheet, {
    header: 1,
    blankrows: false,
    defval: ''
  });

  if (asRows.length === 0) {
    throw new Error('The first sheet is empty.');
  }

  const columns = asRows[0].map((column) => normalizeCell(column));
  const rows = asRows.slice(1).map((row) => {
    const rowRecord: Record<string, string> = {};
    columns.forEach((column, index) => {
      if (!column) {
        return;
      }
      rowRecord[column] = normalizeCell(row[index]);
    });
    return rowRecord;
  });

  return {
    fileName: file.name,
    sheetName,
    columns,
    rows
  };
};
