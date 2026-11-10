# Assul - Claude v2 para GitHub e Vercel

**Actualización literal de Matheus, 10 de noviembre de 2026:** candidata local, no publicada. El snippet se solicita al abrir ambas páginas, incluso ante una recusa. La interfaz envía señales de consentimiento, pero su ejecución diferida no garantiza negación anterior al primer GTM asíncrono. Retirar permiso no descarga GTM ni impide su conexión inicial. No se instala Ads directo ni se crean eventos de conversión locales. La CSP admite únicamente el hash del bloque inline confirmado, sin nuevos dominios ni unsafe-inline. Los informes GTM-only/ADS anteriores describen versiones históricas. Ver `checks/MATHEUS-EXACT-QA-20261110.md` para pruebas y límites actuales.

Versión elegida por el usuario el 5 de noviembre de 2026. WhatsApp confirmado: **+55 41 3667-5877**. Se preparó sobre una copia del original; la vista pública de opiniones y la carpeta original no se modificaron.

El destino está verificado: proyecto **assul-site** del equipo **Assul's projects**, conectado a `arturojaa96-ship-it/Assul-Site`, rama `main`, y al dominio `www.xn--assulautorizadapeas-myb.com.br`. Vercel tiene Framework Preset **Other**, Root Directory vacía, Node.js **24** y ningún override de compilación.

Esta candidata pasó las comprobaciones locales. La publicación y las pruebas del nuevo despliegue en el dominio de producción todavía están pendientes; este documento no confirma una publicación completada. Consulte `DEPLOYMENT.md` para el procedimiento y el despliegue previo de recuperación.

## Contenido

- `public/`: únicos archivos que se deben servir públicamente; HTML, CSS, JS, logos, fotos, favicons, manifest, robots y sitemap.
- `vercel.json`: sitio estático, salida `public`, cabeceras de seguridad y sin API/rewrites.
- `package.json` y `package-lock.json`: herramientas de comprobación sin dependencias npm.
- `.github/workflows/check.yml`: CI de validación sin credenciales de despliegue.
- `scripts/`: revisión de enlaces/activos, pruebas de formularios e inyección, servidor local y manifiesto.
- `checks/`: huellas de activos originales y evidencia de revisión.
- `DEPLOYMENT.md`, `SECURITY.md`, `SOURCES.md`, `PENDING.md`, `DIFFERENCES.md`: publicación, rollback, límites y fuentes.
- `MANIFEST.json`: tamaño y SHA-256 de cada archivo, excluyendo el propio manifiesto.

## Comprobar

Requiere Node.js 24 (también usa APIs disponibles desde Node 22). No necesita `npm install` ni variables de entorno.

```text
npm run check
npm run smoke
npm run preview
```

La vista local se abre en `http://127.0.0.1:8790/`. El smoke test abre un puerto efímero únicamente en loopback y lo cierra al terminar. Los tests de WhatsApp usan un navegador simulado: no mandan mensajes reales.

```text
npm run manifest
```

Regenera el manifiesto después de cualquier modificación. Consulte `checks/QA.md` para resultados y límites de la revisión efectuada.

No copie el antiguo `server.js`, `api/`, `node_modules`, `.git`, `.env`, `.vercel` ni la configuración antigua de Vercel a este paquete. No hay backend, tienda, chat ni base de datos.
