// Submit all sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver — engines
// that consume the IndexNow feed). Google does NOT use IndexNow, but this gets
// Bing crawling every page fast, with no login required.
//
// Run AFTER deploy (the key file must be live at the domain root first):
//   node scripts/indexnow.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = 'fasttypinglab.com';
const KEY = '1f4d64207e83076b1800b802024bde1c';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const sitemap = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

console.log(`IndexNow: submitted ${urlList.length} URLs → HTTP ${res.status} ${res.statusText}`);
console.log('(200/202 = accepted; 403 = key not found yet — deploy the key file first)');
