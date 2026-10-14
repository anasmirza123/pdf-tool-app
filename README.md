# DocuForge — PDF & Document Tools

42 browser-based tools (PDF, converters, images, OCR, utilities). All file processing runs
locally in the browser — your file content is never uploaded to a server.

This is a **Vite + React + TypeScript** single-page app styled with **Tailwind CSS v4**.
It is not a Next.js project and has no backend, database or API keys.

## Run locally
Requires Node.js **22.13 or newer** (pdfjs-dist 6 needs it).
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # regenerates public/sitemap.xml, then builds to dist/
npm run preview    # serve the production build locally
```
Open the site through the dev server (or a deployed URL). Double-clicking `index.html`
does not work: the browser cannot run `/src/main.tsx` (TypeScript/JSX) without Vite.

## How everything is connected
```
index.html                      the only HTML file; every URL is served by it
 └─ <div id="root">             the mount point
 └─ <script type="module" src="/src/main.tsx">
      src/main.tsx
       ├─ import './index.css'  -> @import "tailwindcss" + @theme (fonts, brand colors)
       └─ <App />               src/App.tsx: reads the URL (history API), picks a page,
            │                   and calls applySEO() to set title/meta/canonical/JSON-LD
            ├─ pages (lazy)     HomePage, ToolDirectoryPage, ToolPage, BlogPage,
            │                   LegalPage, ContactPage, AdminDashboardPage
            ├─ components       Navbar, Footer, SearchModal, FileUploader, ResultCard, ...
            ├─ config           tools.ts (42 tools, titles, FAQs), blog.ts, seo.ts
            └─ services         pdfEngine, renderEngine, conversionEngine, imageEngine,
                                ocrEngine (pdf-lib, pdf.js, jszip, docx, tesseract.js)
```
| File | Role |
|---|---|
| `package.json` | dependencies and scripts (`dev`, `build`, `seo:sitemap`, `lint`) |
| `vite.config.ts` | enables the React and Tailwind plugins (`@vitejs/plugin-react`, `@tailwindcss/vite`) |
| `src/index.css` | Tailwind v4 is configured here (`@theme`). There is **no** `tailwind.config.*` file — v4 does not need one |
| `src/App.tsx` | the router: `/` home, `/tools`, `/blog`, `/blog/<slug>`, `/privacy`, `/terms`, `/security`, `/contact`, `/admin`, `/<tool-slug>` |
| `src/pages/BlogPage.tsx` | renders both the blog list and a single post (there is no separate `BlogPostPage`) |
| `vercel.json`, `public/_redirects` | rewrite every path to `index.html` so direct links work; `vercel.json` also sets security headers |
| `public/` | `favicon.svg`, icons, `og-image.png`, `site.webmanifest`, `robots.txt`, `sitemap.xml` |
| `scripts/generate-sitemap.ts` | builds `public/sitemap.xml` from `tools.ts` and `blog.ts` (runs before every build) |

To add a tool: add an entry to `src/config/tools.ts`, handle its `id` in the `switch` in
`src/pages/ToolPage.tsx`, then run `npm run seo:sitemap`.

## Deploy
Static site (Vercel framework preset "Vite": build command `npm run build`, output `dist`).
Set the environment variable `VITE_SITE_URL` to your real domain (see `.env.example`).

## Before launch — things you must set
- Replace the placeholder domain `https://docuforge.app` in `public/robots.txt` and in the
  two image URLs (`og:image`, `twitter:image`) of `index.html`.
- `src/pages/ContactPage.tsx` → replace `SUPPORT_EMAIL` with your real inbox.
  The form opens the visitor's email app (`mailto:`); there is no backend to receive it.
- `src/pages/AdminDashboardPage.tsx` → change `ADMIN_PASSCODE`. This is a light
  client-side gate only (visible in the JS bundle), not real authentication.
  The dashboard shows per-browser history, not site-wide analytics.
- Run `npm install` once so the lockfiles include the `tsx` dev dependency.
  (Keep only one lockfile in use: `package-lock.json` for npm or `bun.lock` for bun.)

## Known limitations (stated honestly in the UI too)
- OCR and some PDF rendering fetch engine data (fonts, language model) from a public CDN
  (jsDelivr) at runtime. File contents are never sent.
- Title, canonical, Open Graph and JSON-LD tags are set by JavaScript per page. Search
  engines that run JavaScript (Google) see them; link previews from crawlers that do not
  run JavaScript fall back to the defaults in `index.html`. Prerendering would fix that.
- PDF → Word/Excel/PowerPoint are best-effort text/position extractions:
  Excel output is CSV; PowerPoint output is a ZIP of slide images + outline (not .pptx).
- Word → PDF extracts text/paragraphs from .docx (no images/tables/fonts).
  Excel → PDF reads the cell values of every worksheet in an .xlsx (no formulas/charts),
  showing at most 8 columns per sheet.
- PDF text output supports Latin characters; other scripts are replaced with "?" in
  generated PDFs (watermark, Word/Excel/slides → PDF). Word and OCR text outputs keep all scripts.
- Unlock PDF: files that only restrict permissions are rebuilt with text intact; files that
  need a password to open require that password and are rebuilt from page images (text is
  no longer selectable). Other PDF tools stop with a message when a file is encrypted.
- Sign PDF places a drawn image signature; it is not a cryptographic digital signature.
- Compress PDF: "High/Recommended" may rasterize pages when structural optimization
  can't shrink the file (text becomes non-selectable; the result panel says so).
