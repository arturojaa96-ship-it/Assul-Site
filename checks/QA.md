# Evidencia de comprobación - 05/11/2026

## Automatizada

`npm run check` pasó sobre la candidata terminada:

- 2 páginas, 26 archivos públicos.
- 31 referencias locales a archivos y 8 anclas comprobadas; ningún archivo faltante.
- 12 enlaces WhatsApp del HTML al número confirmado; los generados por JS también conservan origen, teléfono y parámetros.
- 19 logos/imágenes idénticos byte a byte respecto al original.
- Casos: modelo vacío, consentimiento obligatorio, HTML/`onerror` tratado como texto, `javascript:`, `&text=`, fragmentos y parámetros UTM; destino fijo, una única navegación y ausencia de analítica/GET de campos.
- Sin backend, API, `server.js`, ejecutables externos, almacenamiento de formularios ni dependencias npm.

`npm run smoke` pasó con 15 solicitudes locales y las cabeceras declaradas en Vercel:

- 200: `/`, `/privacidade`, CSS, JS, logo y foto de producto.
- 404: `/api/comments`, `/api/tecnicos`, `/server.js`, `/.env`, `/.git/config`, `/README.md`, `/package.json`, `/scripts/check.cjs`, `/checks/assets.sha256.json`.
- Los cuerpos de rutas inesperadas no se imprimen. Este resultado es local; no se ha atribuido al dominio de producción.

`npm install --package-lock-only --ignore-scripts --offline` confirmó un paquete sin dependencias; no se instaló código externo. `node --check`/`vm.Script` verificaron sintaxis del JS real.

## Navegador Chrome

La candidata se sirvió solo en loopback. Se revisaron escritorio (viewport 1536 px) y móvil (375 × 812): sin desborde horizontal; ancho del documento igual al área útil (1521 y 360 px, respectivamente, descontando scrollbar). Imágenes de productos y logos disponibles; cero imágenes completas con ancho natural cero. Ningún error de consola después de cargar con las cabeceras de seguridad.

Se verificó error visible de modelo vacío y de cadastro profesional incompleto, máscara de CNPJ (`30.401.920/0001-82`), enlaces de WhatsApp al destino confirmado y página de privacidad legible en móvil. No se envió una conversación real a WhatsApp. Las dimensiones temporales del navegador se restablecieron al terminar.

## Destino y comprobaciones pendientes

Se verificó en las interfaces de GitHub y Vercel el destino existente: equipo **Assul's projects** (`assuls-projects`), proyecto **assul-site**, repositorio `arturojaa96-ship-it/Assul-Site`, rama `main`, y dominio `www.xn--assulautorizadapeas-myb.com.br` asociado a Production con configuración válida. El proyecto usa Framework Preset **Other**, Root Directory vacía, Node.js **24** y ningún override de compilación.

El despliegue previo de recuperación es [8hHKCkRYwgP2T9YK6oi6PsMkexaK](https://vercel.com/assuls-projects/assul-site/8hHKCkRYwgP2T9YK6oi6PsMkexaK), con fuente `45e974cfd9793dc8e895aef08634778546c12053`. El bundle local externo y su SHA-256 están registrados en `DEPLOYMENT.md`.

Los resultados de esta página corresponden a la candidata local. Después del release quedan pendientes la comprobación del despliegue terminado, el dominio autorizado, imágenes, formularios/WhatsApp, privacidad y respuestas 404 para rutas de backend y archivos privados. Esta evidencia no afirma que la nueva versión ya esté publicada.

No es una auditoría de penetración ni una certificación legal. Los datos societarios están contrastados públicamente, sin certidão actual directa de Receita. El proveedor de hospedaje y WhatsApp tienen comportamientos externos que no controla este sitio estático.
