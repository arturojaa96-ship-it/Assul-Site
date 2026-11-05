const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../public');
const securityHeaders=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../vercel.json'),'utf8')).headers[0].headers;
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.txt':'text/plain','.webmanifest':'application/manifest+json'};
function createServer() {
  return http.createServer((req,res)=>{
    securityHeaders.forEach(h=>res.setHeader(h.key,h.value));
    let pathname;
    try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch {res.writeHead(400).end();return;}
    if(/^\/(?:api(?:\/|$)|server\.js$|\.|scripts(?:\/|$)|checks(?:\/|$))/.test(pathname)){res.writeHead(404).end('Not found');return;}
    if(pathname.endsWith('/'))pathname+='index.html';
    let file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep)){res.writeHead(404).end('Not found');return;}
    if(!path.extname(file)&&fs.existsSync(file+'.html'))file+='.html';
    fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);});
  });
}
module.exports={createServer};
if(require.main===module){const server=createServer();server.listen(Number(process.env.PORT)||8790,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+server.address().port+'/'));}
