import { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { TOOLS_CONFIG } from './config/tools';
import { BLOG_POSTS } from './config/blog';
import { ToolCategory } from './types';
import { applySEO } from './utils/seo';
import {
  SITE_NAME,
  absoluteUrl,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  buildToolJsonLd,
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd
} from './config/seo';

// ============================================================
// HASH-BASED ROUTING HELPERS
// ------------------------------------------------------------
// GitHub Pages par direct URL (e.g. /pdf-tool-app/merge-pdf) 404
// deta hai kyunki wahan SPA fallback support nahi hai.
//
// Isliye hum URL ka HASH use karte hain:
//   https://anasmirza123.github.io/pdf-tool-app/#/merge-pdf
//   https://anasmirza123.github.io/pdf-tool-app/#/blog
//   https://anasmirza123.github.io/pdf-tool-app/#/tools?cat=pdf
//
// GitHub Pages HAMESHA index.html serve karta hai, aur hash
// client-side hota hai — so yeh 100% kaam karta hai.
// ============================================================

/**
 * Current path ko window.location.hash se nikaalo.
 * Examples:
 *   URL: .../#/merge-pdf      → returns "/merge-pdf"
 *   URL: .../#/tools?cat=pdf  → returns "/tools?cat=pdf"
 *   URL: .../                 → returns "/"
 *   URL: .../#                → returns "/"
 */
function getPathFromHash(): string {
  const hash = window.location.hash;
  if (!hash || hash === '#') return '/';
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  return raw.startsWith('/') ? raw : `/${raw}`;
}

/**
 * Programmatically navigate karo — hash update karo.
 * hashchange event fire hoga, state update hogi, page re-render hoga.
 */
function setPathInHash(path: string) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  window.location.hash = clean;
}

// ============================================================
// LAZY-LOADED PAGES (same as before)
// ============================================================
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const ToolDirectoryPage = lazy(() => import('./pages/ToolDirectoryPage').then((m) => ({ default: m.ToolDirectoryPage })));
const ToolPage = lazy(() => import('./pages/ToolPage').then((m) => ({ default: m.ToolPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.LegalPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function App() {
  // Initialize from hash, not pathname
  const [currentPath, setCurrentPath] = useState<string>(() => getPathFromHash());
  const [searchOpen, setSearchOpen] = useState(false);

  // Listen for hash changes (back/forward buttons, manual edits, etc.)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(getPathFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);

    // On first load, if URL has no hash, set it to "/" so the address bar
    // shows a clean #/ (optional but nice)
    if (!window.location.hash) {
      window.location.hash = '/';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigate function — same API as before, so Navbar/Footer don't need changes
  const navigate = (path: string) => {
    if (path === currentPath) return;
    setPathInHash(path);
    // Immediate state update for snappy UI (hashchange will also fire)
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================
  // SEO EFFECT — same as before
  // ============================================================
  useEffect(() => {
    const cleanPath = currentPath.split('?')[0].replace(/^\//, '');

    // 1. Individual tool page
    const matchedTool = TOOLS_CONFIG.find((t) => t.slug === cleanPath);
    if (matchedTool) {
      applySEO({
        title: matchedTool.seoTitle,
        description: matchedTool.seoDescription,
        canonical: absoluteUrl(`/${matchedTool.slug}`),
        jsonLd: buildToolJsonLd(matchedTool)
      });
      return;
    }

    // 2. Tool directory
    if (cleanPath === 'tools') {
      applySEO({
        title: 'All PDF & Document Tools Catalog | DocuForge',
        description:
          'Browse every free DocuForge tool: merge, split, compress and edit PDFs, convert between PDF, Word, Excel, PowerPoint and images, and run OCR — all processed privately in your browser.',
        canonical: absoluteUrl('/tools'),
        jsonLd: buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'All Tools', path: '/tools' }
        ])
      });
      return;
    }

    // 3. Blog
    if (cleanPath === 'blog' || cleanPath.startsWith('blog/')) {
      const slug = cleanPath.split('/')[1];
      const post = slug ? BLOG_POSTS.find((p) => p.slug === slug) : undefined;

      if (slug && !post) {
        applySEO({
          title: 'Article Not Found | DocuForge',
          description: 'This article could not be found. Browse the DocuForge knowledge base for other guides.',
          canonical: absoluteUrl('/blog'),
          robots: 'noindex, follow',
          jsonLd: null
        });
        return;
      }

      if (post) {
        applySEO({
          title: `${post.title} | DocuForge Blog`,
          description: post.description,
          canonical: absoluteUrl(`/blog/${post.slug}`),
          ogType: 'article',
          jsonLd: buildBlogPostingJsonLd(post)
        });
        return;
      }

      applySEO({
        title: 'DocuForge Knowledge Base - Guides, Tutorials & Best Practices',
        description:
          'Practical, in-depth guides on compressing, merging, converting and managing PDF and document files — written by the DocuForge team.',
        canonical: absoluteUrl('/blog'),
        jsonLd: buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' }
        ])
      });
      return;
    }

    // 4. Legal
    if (cleanPath === 'privacy') {
      applySEO({
        title: 'Privacy Policy & Zero Retention Guarantee | DocuForge',
        description:
          'How DocuForge handles your files: in-browser processing, no document uploads, and no server-side retention of your file content.',
        canonical: absoluteUrl('/privacy'),
        jsonLd: buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy' }
        ])
      });
      return;
    }
    if (cleanPath === 'security') {
      applySEO({
        title: 'Security Architecture | DocuForge',
        description:
          'A plain-language look at how DocuForge validates and processes files client-side, and what that does and doesn\u2019t protect against.',
        canonical: absoluteUrl('/security'),
        jsonLd: buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Security', path: '/security' }
        ])
      });
      return;
    }
    if (cleanPath === 'terms') {
      applySEO({
        title: 'Terms of Service | DocuForge',
        description: 'The terms that govern your use of DocuForge\u2019s free online PDF and document tools.',
        canonical: absoluteUrl('/terms'),
        jsonLd: buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Terms of Service', path: '/terms' }
        ])
      });
      return;
    }

    // 5. Contact
    if (cleanPath === 'contact') {
      applySEO({
        title: 'Contact Support & Feedback | DocuForge',
        description:
          'Questions about a document format, a bug report, or a tool request \u2014 get in touch with the DocuForge team.',
        canonical: absoluteUrl('/contact'),
        jsonLd: buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' }
        ])
      });
      return;
    }

    // 6. Admin
    if (cleanPath === 'admin') {
      applySEO({
        title: 'Admin Dashboard | DocuForge',
        description: 'Internal dashboard showing the tool history stored in this browser. Not intended for search engines.',
        canonical: absoluteUrl('/admin'),
        robots: 'noindex, nofollow',
        jsonLd: null
      });
      return;
    }

    // 7. Homepage
    if (cleanPath === '') {
      applySEO({
        title: `${SITE_NAME} - PDF & Document Tools`,
        description:
          'Fast, secure, and private online tools to merge, split, compress, convert, rotate, OCR, and edit PDFs, images, and documents directly in your browser.',
        canonical: absoluteUrl('/'),
        jsonLd: [buildOrganizationJsonLd(), buildWebsiteJsonLd()]
      });
      return;
    }

    // 8. Unknown route
    applySEO({
      title: 'Page Not Found | DocuForge',
      description: 'The page you requested could not be found.',
      canonical: absoluteUrl(currentPath.split('?')[0]),
      robots: 'noindex, follow',
      jsonLd: null
    });
  }, [currentPath]);

  // ============================================================
  // ROUTE RESOLVER — same as before
  // ============================================================
  const renderCurrentRoute = () => {
    const [pathPart, queryPart] = currentPath.split('?');
    const cleanSlug = pathPart.replace(/^\//, '');

    // 1. Home
    if (cleanSlug === '' || cleanSlug === 'index.html') {
      return <HomePage onNavigate={navigate} />;
    }

    // 2. Tool Directory
    if (cleanSlug === 'tools') {
      const urlParams = new URLSearchParams(queryPart || '');
      const catParam = (urlParams.get('cat') as ToolCategory) || 'all';
      return <ToolDirectoryPage initialCategory={catParam} onNavigate={navigate} />;
    }

    // 3. Individual Tool Page
    const tool = TOOLS_CONFIG.find((t) => t.slug === cleanSlug);
    if (tool) {
      return <ToolPage tool={tool} onNavigate={navigate} />;
    }

    // 4. Blog
    if (cleanSlug.startsWith('blog')) {
      const parts = cleanSlug.split('/');
      const blogSlug = parts[1];
      return <BlogPage currentSlug={blogSlug} onNavigate={navigate} />;
    }

    // 5. Legal
    if (['privacy', 'terms', 'security'].includes(cleanSlug)) {
      return <LegalPage type={cleanSlug as any} onNavigate={navigate} />;
    }

    // 6. Contact
    if (cleanSlug === 'contact') {
      return <ContactPage />;
    }

    // 7. Admin
    if (cleanSlug === 'admin') {
      return <AdminDashboardPage />;
    }

    // Fallback: 404
    const popularTools = TOOLS_CONFIG.filter((t) => t.popular).slice(0, 6);
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-white">404</h1>
          <p className="text-sm text-slate-400">The tool or page you requested could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Return Home
          </button>
        </div>
        {popularTools.length > 0 && (
          <div className="pt-6 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-500 mb-3">Or try a popular tool</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularTools.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => navigate(`/${t.slug}`)}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          }
        >
          {renderCurrentRoute()}
        </Suspense>
      </main>

      <Footer onNavigate={navigate} />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectTool={(slug) => {
          if (slug === 'OPEN_SEARCH_EVENT') {
            setSearchOpen(true);
          } else {
            navigate(`/${slug}`);
          }
        }}
      />
    </div>
  );
}
