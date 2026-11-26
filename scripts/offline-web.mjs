// Post-process Metro's single-page export. The hosted app precaches only its
// own immutable build. The portable HTML is the same app with its JS inlined.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const dir='dist';
const clean=fs.readFileSync(path.join(dir,'index.html'),'utf8').replace(/<script[^>]+data-tf-install[^>]*>[\s\S]*?<\/script>/,'');
const source=clean.match(/<script src="([^"]+)" defer><\/script>/);
if(!source)throw Error('Expected a single exported Metro bundle.');
const bundlePath=source[1].replace(/^\//,'');
const js=fs.readFileSync(path.join(dir,bundlePath),'utf8');
const revision=createHash('sha256').update(js+clean).digest('hex').slice(0,14);
const assets=['./','./index.html','./'+bundlePath,'./favicon.ico'];
const worker=`const CACHE='techfluent-shell-${revision}';
const resources=${JSON.stringify(assets)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(resources)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('techfluent-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
const allowed=new Set(resources.map(s=>new URL(s,self.registration.scope).href));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match('./index.html'))));return;}
  if(allowed.has(e.request.url))e.respondWith(caches.open(CACHE).then(async c=>(await c.match(e.request))||fetch(e.request)));
});`;
fs.writeFileSync(path.join(dir,'sw.js'),worker);
const portable=clean.replace(source[0],()=>'<script>'+js.replace(/<\/script/gi,'<\\/script')+'</script>').replace('href="/favicon.ico"',()=> 'href="data:image/x-icon;base64,'+fs.readFileSync(path.join(dir,'favicon.ico')).toString('base64')+'"');
fs.writeFileSync(path.join(dir,'TechFluent.html'),portable);
const hosted=clean.replace('src="/_expo','src="./_expo').replace('href="/favicon.ico"','href="./favicon.ico"').replace('</body>','<script data-tf-install>if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}</script></body>');
fs.writeFileSync(path.join(dir,'index.html'),hosted);
console.log('Wrote hosted offline shell and standalone TechFluent.html.');
