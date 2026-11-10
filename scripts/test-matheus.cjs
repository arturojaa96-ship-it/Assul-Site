const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const inline = "\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n";
const snippet = '<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-5RM4RSMJ"></script>\n<script>' + inline + '</script>';
const hash = 'sha256-' + crypto.createHash('sha256').update(inline).digest('base64');
assert.equal(hash, 'sha256-jYHg7tXSuuVUqjy+JeRT8vyG97+Spkw5IFHdQEBbmrw=');
for (const name of ['index.html', 'privacidade.html']) {
 const html = fs.readFileSync(path.join(root,'public',name),'utf8');
 assert(html.includes('<head>\n'+snippet+'\n'), name+' placement');
 const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(x => !x[1].includes('application/ld+json'));
 assert.equal(scripts.filter(x=>!x[1].includes('src=')).length,1);
 assert.equal(scripts.filter(x=>x[1].includes('https:')).length,1);
 assert.equal(scripts.find(x=>!x[1].includes('src='))[2],inline);
 assert.equal((html.match(/src="assets\/privacy\.js\?v=matheus-20261110"/g)||[]).length,1);
 assert(!html.includes('src="assets/privacy.js"'));
 assert(!/<noscript[\s\S]*?iframe/i.test(html));
 for(const id of ['privacy-panel','privacy-status','privacy-accept','privacy-reject','privacy-cancel']) assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
 assert(html.includes('antes da sua escolha'));
}
const sandbox={};sandbox.window=sandbox;vm.runInNewContext(inline,sandbox);
assert.equal(typeof sandbox.gtag,'function');assert.equal(sandbox.dataLayer.length,1);assert.equal(sandbox.dataLayer[0][0],'js');assert.equal(Object.prototype.toString.call(sandbox.dataLayer[0][1]),'[object Date]');
const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
const baseline="default-src 'self'; script-src 'self' https://www.googletagmanager.com/gtm.js https://www.googletagmanager.com/gtag/js; style-src 'self'; img-src 'self' data: https://pagead2.googlesyndication.com/ccm/collect; font-src 'self'; connect-src https://pagead2.googlesyndication.com/ccm/collect; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'";
assert.equal(config.headers[0].headers.find(x=>x.key==='Content-Security-Policy').value,baseline.replace("script-src 'self'","script-src 'self' '"+hash+"'"));
for(const name of ['index.html','privacidade.html','assets/app.js','assets/privacy.js']) {
 const code=fs.readFileSync(path.join(root,'public',name),'utf8');
 assert(!/AW-\d|\/gtag\/js|gtm\.start|event:\s*['"]gtm\.js|gtag\(\s*['"](?:config|event)['"]|\bsend_to:|\buser_data:/.test(code),name);
}
const privacy=fs.readFileSync(path.join(root,'public/assets/privacy.js'),'utf8');
assert(!/googletagmanager\.com|createElement|appendChild|function gtag|gtag\('js'/.test(privacy));
assert.equal((snippet.match(/gtag\('js'/g)||[]).length,1);
console.log(JSON.stringify({result:'PASS',pages:2,inlineHash:hash,globalGtag:true,jsInitPerPage:1,dynamicLoaders:0,additionalStartupEvents:0,scope:'Exact canonical formatting matches screenshot code tokens; original message whitespace unavailable. Offline only.'},null,2));
