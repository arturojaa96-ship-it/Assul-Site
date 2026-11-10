const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{if(e.name==='MANIFEST.json'||e.name==='.git'||e.name==='node_modules'||e.name==='.vercel'||e.name==='review')return[];return e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)];});}
const files=walk(root).map(file=>{const bytes=fs.readFileSync(file);return{path:path.relative(root,file).replaceAll('\\','/'),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};}).sort((a,b)=>a.path.localeCompare(b.path,'en'));
const data={format:1,note:'SHA-256 covers every packaged file except MANIFEST.json itself and the local review-only folder.',files};
fs.writeFileSync(path.join(root,'MANIFEST.json'),JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({files:files.length,bytes:files.reduce((sum,f)=>sum+f.bytes,0),manifest:'MANIFEST.json'}));
