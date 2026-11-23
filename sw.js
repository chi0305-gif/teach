/* 鏡中番薯的國文世界：Service Worker（PWA 離線快取）
 *
 * 策略
 *   網頁本身（index.html）：先連網拿最新版，連不上才用快取 → 老師更新網站後，學生一連網就看到新版。
 *   Three.js 函式庫（jsdelivr，網址含版本號，不會變）：先用快取，沒有才下載。
 *   Google 字型、圖示、manifest：先用快取，同時在背景更新。
 *   其他（Padlet、YouTube、Google Apps Script 送出紀錄、所有 POST）：不經過快取，直接連網。
 *
 * 改了這個檔案（或想強迫所有裝置清掉舊快取）時，把 VERSION 改一個數字即可。
 */
const VERSION = 'v2';
const CORE = 'core-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;
const CORE_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/icon.svg'
];
const THREE_BASE = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
const THREE_FILES = [
  'build/three.module.js',
  'examples/jsm/controls/OrbitControls.js',
  'examples/jsm/renderers/CSS2DRenderer.js',
  'examples/jsm/geometries/RoundedBoxGeometry.js',
  'examples/jsm/utils/BufferGeometryUtils.js',
  'examples/jsm/math/SimplexNoise.js'
].map((f) => THREE_BASE + f);

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const core = await caches.open(CORE);
    await core.addAll(CORE_FILES);
    // 函式庫抓不到（例如學校網路擋住）也不要讓安裝失敗
    const rt = await caches.open(RUNTIME);
    await Promise.all(THREE_FILES.map((u) => rt.add(new Request(u, { mode: 'cors' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keep = new Set([CORE, RUNTIME]);
    for (const k of await caches.keys()) if (!keep.has(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

const isPage = (req) => req.mode === 'navigate' || (req.destination === 'document');
const sameOrigin = (url) => url.origin === self.location.origin;

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // 送出學習紀錄（POST）完全不碰
  const url = new URL(req.url);

  if (sameOrigin(url) && isPage(req)) { e.respondWith(networkFirst(req)); return; }
  if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('/three@')) { e.respondWith(cacheFirst(req)); return; }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') { e.respondWith(staleWhileRevalidate(req)); return; }
  if (sameOrigin(url) && !url.pathname.endsWith('.txt')) { e.respondWith(staleWhileRevalidate(req)); return; }
  // 其他網站：交給瀏覽器自己處理
});

async function networkFirst(req) {
  const cache = await caches.open(CORE);
  try {
    const res = await fetch(req, { cache: 'no-store' });
    if (res && res.ok) cache.put('./index.html', res.clone());
    return res;
  } catch (err) {
    return (await cache.match('./index.html')) || (await cache.match('./')) || new Response(
      '<meta charset="utf-8"><p style="font:18px sans-serif;padding:2em">目前沒有網路，而且這台裝置還沒存過網站。請連上網路後再打開一次。</p>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(req);
  const net = fetch(req).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  }).catch(() => hit);
  return hit || net;
}
