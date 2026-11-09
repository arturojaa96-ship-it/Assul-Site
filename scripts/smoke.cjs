const assert=require('node:assert/strict');
const {createServer}=require('./serve.cjs');
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  const cases={'/':200,'/privacidade':200,'/assets/styles.css':200,'/assets/app.js':200,'/assets/privacy.js':200,'/assets/brand/logo-assul-light-bg.svg':200,'/assets/img/peca-compressor.webp':200,'/api/comments':404,'/api/tecnicos':404,'/server.js':404,'/.env':404,'/.git/config':404,'/README.md':404,'/package.json':404,'/scripts/check.cjs':404,'/checks/assets.sha256.json':404};
  try{for(const [url,status]of Object.entries(cases)){const response=await fetch(origin+url);assert.equal(response.status,status,url);assert(response.headers.get('content-security-policy').includes("form-action 'none'"));await response.arrayBuffer();}console.log(JSON.stringify({result:'PASS',requests:Object.keys(cases).length,backendRoutes:'404',exposedSourceFiles:0,securityHeaders:true}));}
  finally{await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
