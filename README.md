# DORA Register of Information Validator

A modular web app for validating uploaded RoI files against four validation sections:

1. Technical checks
2. DPM Technical checks
3. DPM Business validation rules
4. LEI-EUID checks

The app parses an uploaded Excel workbook (`.xlsx`/`.xls`), runs rule sets by category, and lets users inspect findings through tabbed sections.

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- `xlsx` for client-side spreadsheet parsing

## Run locally

### 1) Install dependencies

```bash
npm install
```

### 2) Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3) Production build check

```bash
npm run build
npm run start
```

## Deploy on Vercel

This project is Vercel-ready out of the box.

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel.
3. Keep default framework detection (`Next.js`).
4. Deploy.

No extra environment variables are required for the current version.

## Modular validation design

- `lib/fileParser.ts`: workbook parsing and row normalization.
- `lib/validationRules.ts`: category-specific rule modules and runner.
- `components/ValidationTabs.tsx`: category navigation.
- `components/ValidationPanel.tsx`: per-category findings rendering.
- `app/page.tsx`: upload workflow and orchestration.

To add more checks, extend `rulesByCategory` in `lib/validationRules.ts` with new rule definitions.
