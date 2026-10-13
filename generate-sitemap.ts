/**
 * Regenerates public/sitemap.xml from the current tool and blog catalogs, so the
 * sitemap never drifts out of sync as tools or articles are added/removed.
 *
 * Usage:  npm run seo:sitemap
 * (Also safe to run as part of your CI/build pipeline before deploying.)
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { TOOLS_CONFIG } from '../src/config/tools';
import { BLOG_POSTS } from '../src/config/blog';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = (process.env.VITE_SITE_URL || 'https://docuforge.app').replace(/\/+$/, '');

interface UrlEntry {
  path: string;
  priority: string;
  changefreq: string;
}

const staticEntries: UrlEntry[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/tools', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.6', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  { path: '/security', priority: '0.3', changefreq: 'yearly' },
  { path: '/contact', priority: '0.3', changefreq: 'yearly' }
  // Intentionally excluded: /admin (internal demo page, noindex — see robots.txt and App.tsx)
];

const toolEntries: UrlEntry[] = TOOLS_CONFIG.map((tool) => ({
  path: `/${tool.slug}`,
  priority: tool.popular ? '0.9' : '0.8',
  changefreq: 'monthly'
}));

const blogEntries: UrlEntry[] = BLOG_POSTS.map((post) => ({
  path: `/blog/${post.slug}`,
  priority: '0.5',
  changefreq: 'yearly'
}));

const allEntries = [...staticEntries, ...toolEntries, ...blogEntries];

// lastmod is intentionally omitted: this project has no real per-page "last modified"
// timestamp to report, and a fabricated date would be inaccurate. Add real lastmod
// values here once your deploy pipeline can supply them (e.g. from git history).
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (entry) =>
      `  <url>\n    <loc>${SITE_URL}${entry.path}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
  )
  .join('\n')}
</urlset>
`;

const outPath = resolve(__dirname, '../public/sitemap.xml');
writeFileSync(outPath, xml, 'utf8');
console.log(`Wrote ${allEntries.length} URLs to ${outPath}`);
