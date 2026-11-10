const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'public');
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const htmlFiles = walk(pub).filter(f => f.endsWith('.html'));
const publicFiles = walk(pub);
assert(!fs.existsSync(path.join(root, 'api')), 'No root api/ allowed');
assert(!fs.existsSync(path.join(root, 'server.js')), 'No server.js allowed');
for (const file of publicFiles) {
  const relative = path.relative(pub,file).replaceAll('\\','/');
  assert(!/(^|\/)(?:\.|api(?:\/|$)|node_modules|server\.js|README|package\.json)/i.test(relative), 'Unsafe public file: ' + relative);
  assert(/\.(?:html|css|js|svg|png|jpg|webp|txt|xml|webmanifest)$/.test(relative), 'Unexpected public format: ' + relative);
}
let assets = 0, anchors = 0, whatsapp = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file,'utf8');
  assert(!/GTM-(?!5RM4RSMJ\b)|google-analytics|\[RAZÃO SOCIAL\]|\[EMAIL|\[DATA\]|\[HORÁRIO|00\.000\.000\/0001-00|554131950160/.test(html), 'Unconfirmed data/integration');
  assert(html.includes('rel="canonical" href="https://www.xn--assulautorizadapeas-myb.com.br/'), 'Approved canonical missing');
  assert(html.includes('30.401.920/0001-82'), 'Public legal identity missing');
  assert(!/\sstyle=/.test(html), 'CSP forbids inline styles');
  assert(!/<(?:input|select)\b[^>]*\bname=/.test(html), 'No form GET field names');
  for (const m of html.matchAll(/\b(src|href)="([^"]+)"/g)) {
    const ref = m[2];
    if (ref.startsWith('#')) {
      if(ref.length>1) { assert(html.includes(`id="${ref.slice(1)}"`), 'Broken anchor '+ref); anchors++; }
    } else if(ref.startsWith('https://wa.me/')) {
      assert.equal(new URL(ref).pathname,'/554136675877'); whatsapp++;
    } else if(!/^(https?:|tel:|data:)/.test(ref)) {
      assert(fs.existsSync(path.resolve(path.dirname(file),ref.split(/[?#]/)[0])), 'Missing '+ref); assets++;
    }
  }
  for (const m of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for(const item of m[1].split(',')) { assert(fs.existsSync(path.resolve(path.dirname(file),item.trim().split(/\s+/)[0]))); assets++; }
  }
}
const config = JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
assert.equal(config.outputDirectory,'public'); assert.equal(config.framework,null);
assert(!config.rewrites && !config.builds && !config.routes, 'No backend/catchall routing');
const headers = Object.fromEntries(config.headers[0].headers.map(h=>[h.key,h.value]));
assert(headers['Content-Security-Policy'].includes("form-action 'none'"));
assert(!headers['Content-Security-Policy'].includes('unsafe-inline'));
assert(!headers['X-Robots-Tag'], 'Production index policy must come from page metadata');
const js = fs.readFileSync(path.join(pub,'assets/app.js'),'utf8');
assert(!/innerHTML|outerHTML|eval\s*\(|document\.write|fetch\s*\(|XMLHttpRequest|dataLayer|window\.open|localStorage|sessionStorage/.test(js), 'Unsafe/external JS primitive');
new vm.Script(js);
const elements = new Map();
function element(value='') {
  return {value,checked:false,hidden:true,disabled:true,attrs:{},events:{},classList:{toggle(){}},focus(){},addEventListener(type,fn){this.events[type]=fn;},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},getAttribute(k){return this.attrs[k]??null;},toggleAttribute(k,on){if(on)this.attrs[k]='';else delete this.attrs[k];}};
}
const ids = ['form-pedido','equipamento','campo-outro','outro','modelo','peca','erro-modelo','form-profissional','p-nome','p-cidade','p-segmento','p-cnpj','p-consent','erro-prof'];
ids.forEach(id=>elements.set(id,element()));
elements.get('equipamento').value='Refrigerador'; elements.get('p-segmento').value='Assistência técnica';
const links=[element(),element()]; links[0].attrs={'data-cta':'hero'}; links[1].attrs={'data-cta':'cat-teste','data-categoria':'<script>alert(1)</script> &text=x#'};
const buttons=[element(),element()]; const navigations=[];
let ready;
const window={location:{assign(url){navigations.push(url);}}};
const document={getElementById(id){return elements.get(id);},querySelectorAll(selector){return selector==='[data-wpp]'?links:buttons;},addEventListener(type,fn){if(type==='DOMContentLoaded')ready=fn;}};
vm.runInNewContext(js,{window,document,encodeURIComponent,String,Object,Array,Error},{timeout:1000}); ready();
assert(buttons.every(b=>!b.disabled));
const event={preventDefault(){}};
elements.get('form-pedido').events.submit(event); assert.equal(navigations.length,0); assert.equal(elements.get('erro-modelo').hidden,false);
const attack='<img src=x onerror=alert(1)> javascript:alert(2) &text=override#fragment';
elements.get('modelo').value=attack; elements.get('peca').value='</textarea><script>alert(3)</script> &utm_source=evil';
elements.get('form-pedido').events.submit(event);
function validateDestination(raw) {const u=new URL(raw);assert.equal(u.origin,'https://wa.me');assert.equal(u.pathname,'/554136675877');assert.equal([...u.searchParams].length,4);assert.equal(u.searchParams.get('utm_source'),'site');assert.equal(u.searchParams.get('utm_medium'),'whatsapp');return u;}
const u=validateDestination(navigations[0]); assert(u.searchParams.get('text').includes(attack));
links.forEach(link=>validateDestination(link.attrs.href));
elements.get('form-profissional').events.submit(event); assert.equal(navigations.length,1);
assert.equal(elements.get('p-nome').attrs['aria-invalid'],'true'); assert.equal(elements.get('p-cidade').attrs['aria-invalid'],'true');
elements.get('p-nome').value=attack; elements.get('p-cidade').value='Curitiba / PR';
elements.get('form-profissional').events.submit(event); assert.equal(navigations.length,1);
elements.get('p-consent').checked=true; elements.get('p-cnpj').value='30.401.920/0001-82';
elements.get('form-profissional').events.submit(event); assert.equal(navigations.length,2); validateDestination(navigations[1]);
assert(!window.dataLayer);
const frozen = JSON.parse(fs.readFileSync(path.join(root,'checks/assets.sha256.json'),'utf8'));
for(const [relative,expected] of Object.entries(frozen)) {
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(pub,relative))).digest('hex'),expected,'Brand/image changed: '+relative);
}
console.log(JSON.stringify({result:'PASS',pages:htmlFiles.length,publicFiles:publicFiles.length,localAssetReferences:assets,anchors,whatsappLinks:whatsapp,unchangedBrandImages:Object.keys(frozen).length,securityCases:['empty-model','consent-required','html-as-text','fixed-whatsapp-origin','encoded-url-parameters','single-navigation','no-analytics','no-form-get-fields','no-api-or-server-files']}));
