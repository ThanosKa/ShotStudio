/**
 * IndexNow ping: tells Bing, Yandex and other IndexNow engines which URLs exist.
 * (Google does not support IndexNow; use Search Console for Google.)
 *
 * Run AFTER a deploy, once https://shotstudio.dev/bedfc13f5733ed9217c99edc5423cdac.txt is live:
 *   node scripts/indexnow.mjs            # submit every URL in the live sitemap
 *   node scripts/indexnow.mjs --dry-run  # print the payload, send nothing
 *
 * The key file in public/ proves we own the host. It is not a secret.
 */

const HOST = "shotstudio.dev";
const KEY = "bedfc13f5733ed9217c99edc5423cdac";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const dryRun = process.argv.includes("--dry-run");

const sitemapRes = await fetch(SITEMAP_URL);
if (!sitemapRes.ok) {
  console.error(`Could not fetch ${SITEMAP_URL}: ${sitemapRes.status}`);
  process.exit(1);
}
const xml = await sitemapRes.text();
const urlList = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);

if (urlList.length === 0) {
  console.error("No <loc> entries found in the sitemap.");
  process.exit(1);
}

const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };

if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

// 200 = accepted, 202 = accepted pending key validation.
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`);
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
