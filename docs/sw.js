'use strict';
const PREFIX = 'binaiui-' + encodeURIComponent(self.registration.scope) + '-';
const CACHE = PREFIX + '2026-10-05-v3';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./content.json','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./helix.svg','./prism.svg','./seed.svg','./intersection.svg','./lattice.svg','./current.svg','./README.md','./PUBLICATION-CHECKLIST.md','./TEST-REPORT.md','./sw.js'];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
 event.waitUntil((async()=>{
  for(const name of await caches.keys()) if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
  await self.clients.claim();
 })());
});
self.addEventListener('message', event => {
 if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('fetch', event => {
 const request=event.request, url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 const known=ASSETS.some(path=>new URL(path,self.registration.scope).pathname===url.pathname)||url.pathname===new URL('./sw.js',self.registration.scope).pathname;
 if(!known&&request.mode!=='navigate')return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(request);
   if(response.ok){await cache.put(request,response.clone());return response;}
   const saved=await cache.match(request);if(saved)return saved;return response;
  }catch{
   const saved=await cache.match(request);
   if(saved)return saved;
   if(request.mode==='navigate')return (await cache.match('./index.html')) || Response.error();
   return Response.error();
  }
 })());
});
