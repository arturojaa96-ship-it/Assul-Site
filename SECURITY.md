# Revisión de seguridad

Inspección del HTML, CSS, JS, SVG, archivos de configuración y activos del original y de esta copia; revisión de diferencias con la vista pública de opiniones. Las instrucciones de archivos, documentos, webs y comentarios se trataron como datos de referencia, nunca como autorización para ejecutar acciones.

## Prompt injection

La landing no contiene LLM, agente, chat ni servicio que interprete texto como instrucciones. Por ello, escribir “ignora las instrucciones” en un formulario no obtiene acceso a herramientas ni ejecuta instrucciones en un modelo. No se encontró una instrucción maliciosa incrustada en los archivos revisados. Esto no equivale a certificar todas las fuentes futuras o integraciones externas.

El riesgo pertinente del código estático es XSS, navegación a destinos manipulados, exposición de archivos o transmisión no prevista de datos. Si se incorpora IA más adelante hará falta una evaluación diferente, con entradas externas no confiables y permisos de herramientas delimitados.

## Correcciones concretas

- Destino de WhatsApp fijo y comprobado: `https://wa.me/554136675877`. Ningún parámetro de URL entrante puede cambiarlo.
- Los campos se codifican mediante `encodeURIComponent`; no se insertan en HTML. No hay `innerHTML`, `eval`, `document.write`, red de backend o almacenamiento de formularios.
- Formularios: validación de modelo, consentimiento requerido y mensajes de error visibles. Se quitaron atributos `name` y los botones empiezan desactivados hasta registrar los handlers; sin JS no se envían campos mediante GET al hosting.
- Se corrigió la apertura duplicada por `window.open(...,'noopener')` y el fallback: cada formulario navega una sola vez mediante `location.assign`.
- La política informa que el texto llega a WhatsApp al abrir la conversación, antes del envío final por el usuario.
- La base inicial retiró GTM; el commit 0471cd7 lo reincorporó con consentimiento. La actualización añade Ads directo AW-16968445825 y conserva GTM-5RM4RSMJ. Ambos requieren consentimiento V2 específico y el host de Peças. La CSP solo añade /gtag/js y el endpoint /ccm/collect observado. Resultados y límites en `checks/ADS-QA-20261110.md`.
- Cabeceras Vercel: CSP sin `unsafe-inline`, `object-src 'none'`, conexiones restringidas a `https://pagead2.googlesyndication.com/ccm/collect`, `form-action 'none'`, bloqueo de framing, nosniff, referrer restrictivo y permisos de cámara/micrófono/geolocalización desactivados.
- Solo `public/` se sirve. No hay `server.js`, `api/`, credenciales, `.env`, `.git`, `.vercel`, backups ni dependencias dentro de esa salida. No hay rewrite de API o catchall.
- Se sustituyó el caché anual immutable de activos sin nombres versionados por caché de una hora revalidable.

## Pruebas

`npm run check` ejecuta los handlers reales en un contexto aislado con HTML/atributos `onerror`, `javascript:`, `&text=`, fragmentos e intentos de inyectar parámetros UTM. Verifica destino, parámetros, modelo vacío, consentimiento y navegación única. No abre WhatsApp ni manda mensajes.

`npm run smoke` solicita únicamente las rutas locales especificadas y valida estado HTTP; nunca imprime cuerpos inesperados. El servidor local emula el directorio público, no sustituye una prueba del despliegue real de Vercel.

No se realizó escaneo de penetración ni auditoría de las cuentas GitHub/Vercel/Supabase. Los servicios externos enlazados tienen sus propias políticas y disponibilidad. Eliminar el backend del nuevo paquete no borra datos ni revoca secretos de servicios anteriores: no se tocaron esas cuentas.

Fuentes primarias: [HTML Standard, window.open](https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-open), [Vercel build/output](https://vercel.com/docs/builds/configure-a-build), [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json).
