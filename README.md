# Assul - Claude v2 para GitHub e Vercel

**Actualización GTM-only del 10 de noviembre:** se retira la instalación directa AW-16968445825. GTM-5RM4RSMJ queda como único cargador local, sujeto al consentimiento V2 específico y al dominio de Peças o pruebas locales. La CSP aprobada no cambia. No se añaden conversiones ni se modifica el contenedor remoto o las campañas. Validación local y límites en `checks/GTM-ONLY-QA-20261110.md`; el informe ADS anterior se conserva como histórico.

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
