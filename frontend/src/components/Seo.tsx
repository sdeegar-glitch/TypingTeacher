import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://fasttypinglab.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

interface SeoProps {
  /** Full <title> text, e.g. "Typing Tests | FastTypingLab". */
  title: string;
  /** Meta description (~150–160 chars). */
  description: string;
  /** Canonical path ("/tests") or absolute URL. Defaults to the current route. */
  canonical?: string;
  /** Absolute OG/Twitter image URL. Defaults to the site OG image. */
  image?: string;
  type?: 'website' | 'article';
  /** Keep this page out of search indexes (admin, auth, dashboards). */
  noindex?: boolean;
  /** One or more JSON-LD structured-data objects. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Per-route document head. Emits a self-referencing canonical (fixing the
 * old site-wide homepage canonical), unique title/description, OG + Twitter
 * cards, and optional JSON-LD. Render one <Seo /> near the top of each page.
 */
export default function Seo({ title, description, canonical, image, type = 'website', noindex, jsonLd }: SeoProps) {
  const { pathname } = useLocation();
  const path = canonical ?? pathname;
  const url = path.startsWith('http') ? path : `${SITE_URL}${path}`;
  const img = image ?? DEFAULT_IMAGE;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  );
}
