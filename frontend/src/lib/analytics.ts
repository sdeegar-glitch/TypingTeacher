// Google Analytics 4 (GA4).
//
// 1. Create a GA4 property at https://analytics.google.com → Admin → Data Streams
//    → add a Web stream for https://fasttypinglab.com
// 2. Copy the "Measurement ID" (looks like G-XXXXXXXXXX) and paste it below.
// 3. Commit + deploy. (The Measurement ID is NOT secret — it is exposed in every
//    GA-enabled site's page source by design, so it's safe to commit.)
//
// Until an ID is set, every function below is a no-op, so the site works fine
// without analytics.
export const GA_MEASUREMENT_ID = 'G-LVHEY3B1F0';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialized = false;

/** Load gtag.js once. Safe to call repeatedly. */
export function initAnalytics() {
  if (initialized || !GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  initialized = true;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // We send page views manually on each SPA route change instead of automatically.
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
}

/** Record a single-page-app page view. */
export function trackPageview(path: string) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
