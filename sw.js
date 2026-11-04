/* Tries the network first so updates show up. Falls back to the saved copy when signal is bad. */
const CACHE='worsters-v1';
const FILES=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const saved=await cache.match(e.request,{ignoreSearch:true});
    const live=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque'))cache.put(e.request,r.clone());return r;});
    live.catch(()=>{});
    if(!saved)return live;
    const wait=new Promise(res=>setTimeout(()=>res(saved),2500));
    return Promise.race([live.catch(()=>saved),wait]);
  })());
});
