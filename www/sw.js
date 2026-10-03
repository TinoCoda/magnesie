const CACHE='magnesie-v1';
const FILES=['./',"anim.js","app.js","fonts/big-shoulders-display-latin-700-normal.woff2","fonts/big-shoulders-display-latin-800-normal.woff2","fonts/hanken-grotesk-latin-400-normal.woff2","fonts/hanken-grotesk-latin-500-normal.woff2","fonts/hanken-grotesk-latin-600-normal.woff2","fonts/hanken-grotesk-latin-700-normal.woff2","icon-192.png","icon-512.png","icon-maskable-512.png","index.html","manifest.webmanifest","style.css"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
