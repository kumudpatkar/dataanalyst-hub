# DataAnalyst Hub

A responsive, searchable reference library for data analytics learners and practitioners. Built with Next.js App Router, TypeScript, Tailwind CSS, and Lucide icons. The reference library now contains **151 references** across Excel, Python, SQL, DBMS, Power BI & DAX, Statistics, Pandas & NumPy, and Data Analytics (76 original + 75 additional).

## Features

- Global instant search across reference names, subjects, categories, descriptions, syntax, examples, and tags
- Subject browsing and category labels
- 151 curated references, with the additional 75 included in the updated release
- Detail view with syntax, practical example, expected output, explanation, common mistakes, and related references
- Copy syntax and examples
- Favourites and recently viewed references stored in browser localStorage
- Light/dark theme preference stored locally
- Responsive sidebar and mobile navigation
- `Ctrl+K` / `Cmd+K` search shortcut
- No external database, API key, or environment variables required

## Run locally

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Create a GitHub repository named `dataanalyst-hub`.
2. Upload or push the contents of this folder to the repository root.
3. Sign in to Vercel and choose **Add New → Project**.
4. Import the `dataanalyst-hub` GitHub repository.
5. Keep the detected Next.js framework and default build settings.
6. Select **Deploy**. No environment variables are required.

Every push to the connected production branch will trigger a new deployment.

## Add more references

Edit `data/references.ts`. Each reference is a `Reference` object with a unique `id`, `name`, `subject`, `category`, `description`, `syntax`, `example`, `output`, `explanation`, `mistakes`, `tags`, and optional `related` IDs. The UI search automatically indexes all these fields.

Subject names must match the names in the `subjects` array for subject filtering to work. Existing Pandas/NumPy references are grouped under `Pandas & NumPy`.

## Notes

- Favourites, recently viewed items, and theme settings are stored per browser in localStorage; they do not sync between devices.
- This release includes 151 curated starter references. Review examples against your installed Excel version, SQL database, and Power BI model before using them in production work.
- SQL examples default to MySQL-style syntax unless noted. `FULL OUTER JOIN` is not directly supported in MySQL; emulate it with `LEFT JOIN`/`RIGHT JOIN` and `UNION` when required.
