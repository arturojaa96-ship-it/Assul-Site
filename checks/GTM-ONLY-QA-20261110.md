# Validación local GTM-only para Assul Peças

Fecha: 10 de noviembre de 2026. Base de archivos: main 890fcbead267a49155b7af47f53d35dacaa94e31. Esta revisión sustituye la instalación directa, no las evidencias históricas de ADS-QA-20261110.md.

## Cambio y límites

- Retirados el cargador directo /gtag/js?id=AW-16968445825, gtag js/config y sus metadatos adsEnabled/destination. GTM-5RM4RSMJ es la única instalación local; metadatos gtmEnabled/container describen ese alcance.
- Sin cambios en CSP, formularios, páginas, activos, dominio, contenedor remoto, campañas o conversiones.
- Se conservan consentimiento V2, denegación por defecto, concesión exclusiva de ad_storage tras aceptación, lista exacta de hosts, retirada y todos los fallbacks de almacenamiento/sesión/URL y revalidación.
- La CSP conserva los endpoints mínimos ya aprobados. El contenedor remoto puede cargar sus propias etiquetas; retirar la instalación directa no demuestra que Ads esté ausente dentro del contenedor. No se ha modificado ni ejecutado ese contenedor en esta validación.

## Comprobaciones locales

- npm run check: PASS, 38 grupos de privacidad y 9 casos de seguridad de formularios. Dos páginas, 27 archivos públicos, 35 referencias locales, 8 anclas y 12 enlaces WhatsApp. Las 19 imágenes originales mantienen su SHA-256.
- npm run smoke: PASS, 16 rutas locales, rutas de backend 404, cero archivos fuente expuestos y cabeceras de seguridad válidas.
- Regresiones: exactamente una inserción GTM y un evento de arranque tras aceptación repetida o reevaluación; ausencia de AW directo y comandos js/config/event; cero cargas antes de aceptar o al rechazar; fallos de red/DOM y retirada siguen seguros.
- Pruebas offline en VM y HTTP loopback: no se ejecutaron scripts externos ni se enviaron formularios, mensajes o conversiones. Publicación y comprobación del nuevo despliegue pendientes.

## Recuperación

Para una reversión, revisar un commit nuevo contra la base indicada; no reescribir historial. Esa base volvería a instalar Ads directo. Revalidar consentimiento y producción tras cualquier reversión.
