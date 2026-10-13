/**
 * Minimal, dependency-free SEO tag manager for a client-rendered (CSR) SPA.
 *
 * IMPORTANT LIMITATION (documented, not hidden): this app has no server-side
 * rendering or build-time prerendering. These functions update the live DOM after
 * React renders, which Googlebot (which executes JavaScript) will see — but crawlers
 * and link-unfurlers that do NOT execute JavaScript (many social-media link previews,
 * some lesser search engines) will only ever see the static defaults baked into
 * index.html. For full coverage, a prerendering/SSG build step is recommended later
 * (see the SEO report delivered alongside this change).
 */

function upsertMetaByName(name: string, content: string | undefined): void {
  if (!content) return;
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertMetaByProperty(property: string, content: string | undefined): void {
  if (!content) return;
  let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonical(url: string): void {
  let tag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', url);
}

/** Swap in a single JSON-LD <script> block, keyed by id, removing it when data is null. */
function upsertJsonLd(id: string, data: object | object[] | null): void {
  const existing = document.getElementById(id);
  if (!data) {
    existing?.remove();
    return;
  }
  let tag = existing as HTMLScriptElement | null;
  if (!tag) {
    tag = document.createElement('script');
    tag.id = id;
    tag.type = 'application/ld+json';
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(data);
}

export interface SEOConfig {
  title: string;
  description: string;
  /** Absolute canonical URL for this page. */
  canonical: string;
  /** Defaults to 'website'; use 'article' for blog posts. */
  ogType?: 'website' | 'article';
  /** 'index, follow' (default) or 'noindex, nofollow' for pages that should stay out of search results. */
  robots?: string;
  /** One or more JSON-LD objects to render for this page. Omit/empty to clear. */
  jsonLd?: object | object[] | null;
}

const JSON_LD_ID = 'page-jsonld';

/** Apply a full SEO configuration to the current document. Call this once per route change. */
export function applySEO(config: SEOConfig): void {
  document.title = config.title;
  upsertMetaByName('description', config.description);
  upsertMetaByName('robots', config.robots || 'index, follow');

  upsertMetaByProperty('og:title', config.title);
  upsertMetaByProperty('og:description', config.description);
  upsertMetaByProperty('og:url', config.canonical);
  upsertMetaByProperty('og:type', config.ogType || 'website');

  upsertMetaByName('twitter:title', config.title);
  upsertMetaByName('twitter:description', config.description);

  upsertCanonical(config.canonical);
  upsertJsonLd(JSON_LD_ID, config.jsonLd ?? null);
}
