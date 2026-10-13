# DocuForge — PDF & Document Tools

42 browser-based tools (PDF, converters, images, OCR, utilities). All processing runs
locally in the browser — files are never uploaded to a server.

## Run locally
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build in dist/
```

## Deploy
Static site. `vercel.json` and `public/_redirects` provide the SPA rewrites needed for
direct links such as `/compress-pdf` (Vercel / Netlify).

## Before launch — things you must set
- `src/pages/ContactPage.tsx` → replace `SUPPORT_EMAIL` with your real inbox.
  The form opens the visitor's email app (`mailto:`); there is no backend to receive it.
- `src/pages/AdminDashboardPage.tsx` → change `ADMIN_PASSCODE`. This is a light
  client-side gate only (visible in the JS bundle), not real authentication.
  The dashboard shows per-browser history, not site-wide analytics.

## Known limitations (stated honestly in the UI too)
- OCR and some PDF rendering fetch engine data from a public CDN (jsDelivr) at runtime.
- PDF → Word/Excel/PowerPoint are best-effort text/position extractions:
  Excel output is CSV; PowerPoint output is a ZIP of slide images + outline (not .pptx).
- Word → PDF extracts text/paragraphs from .docx (no images/tables/fonts).
  Excel → PDF reads the first worksheet's cell values from .xlsx (no formulas/charts).
- Unlock PDF removes owner/permission restrictions only, not open-passwords.
- Sign PDF places a drawn image signature; it is not a cryptographic digital signature.
- Compress PDF: "High/Recommended" may rasterize pages when structural optimization
  can't shrink the file (text becomes non-selectable; the result panel says so).
