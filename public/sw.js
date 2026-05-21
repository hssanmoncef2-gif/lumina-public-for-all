// ============================================================
// LUMINA — Service Worker (sw.js)
// Strategy: Cache-first for static assets, network-first for API
// ============================================================

const CACHE_VERSION = 'lumina-v1'
const STATIC_CACHE  = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/comfort',
  '/offline',
  // Fonts cached by browser via next/font — no manual entry needed
]

// Routes that should NEVER be cached
const BYPASS_PATTERNS = [
  /\/api\//,         // API routes — always network
  /\/auth\//,        // Auth routes — always network
  /\/_next\/webpack/, // Hot reload in dev
]

// ---- Install ----

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Non-fatal: some URLs may 404 (screenshots, etc.)
      })
    ).then(() => self.skipWaiting())
  )
})

// ---- Activate ----

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('lumina-') && k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ---- Fetch ----

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Bypass API, auth, and dev routes
  if (BYPASS_PATTERNS.some((p) => p.test(url.pathname))) return

  // _next/static — cache first (immutable hashes)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Everything else — stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request))
})

// ---- Strategies ----

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function staleWhileRevalidate(request) {
  const cache  = await caches.open(DYNAMIC_CACHE)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => null)

  return cached ?? (await fetchPromise) ?? offlineFallback()
}

function offlineFallback() {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Lumina — Offline</title>
  <style>
    body {
      background: #080612;
      color: rgba(255,255,255,0.7);
      font-family: 'Sora', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      margin: 0;
      text-align: center;
      padding: 24px;
    }
    .orb {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(139,92,246,0.4), transparent);
      filter: blur(30px);
      margin: 0 auto 32px;
      animation: pulse 3s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.7;transform:scale(1.1)} }
    h1 { font-size: 22px; font-weight: 500; margin-bottom: 12px; }
    p  { font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.4); line-height: 1.6; }
    button {
      margin-top: 32px;
      padding: 14px 32px;
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      border: none;
      border-radius: 14px;
      color: white;
      font-size: 15px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="orb"></div>
  <h1>You're offline ✦</h1>
  <p>Lumina needs a connection to load.<br>Your journal entries are safe.</p>
  <button onclick="location.reload()">Try again</button>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
