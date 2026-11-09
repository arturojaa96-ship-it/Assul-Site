# Diferencias deliberadas

Respecto al original de Claude, se conservan estructura, colores, responsive, logos y fotos. Los 19 activos de marca/imagen son idénticos byte a byte, verificados por SHA-256.

Se incorporaron razón social/CNPJ/dirección contrastados y el teléfono elegido en todos los contactos. Se quitaron placeholders legales, horarios inventados y promesas comerciales específicas sin confirmar. Se reformuló el aviso de privacidad para reflejar la transmisión real al abrir WhatsApp.

En la base inicial se retiró GTM; el commit 0471cd7 lo reincorporó con consentimiento. El candidato local del 9 de noviembre conserva ese cargador y prepara Ads directo, sin activarlo: véase `review/GOOGLE-ADS-PREPARATION.md`. Se corrigió la apertura duplicada y el fallback GET de formularios, y se preparó una salida `public/` explícita con cabeceras seguras, canonical y sitemap del dominio autorizado. La antigua configuración `/api` → `server.js` no existe en esta versión.

Respecto a la copia pública de opiniones, esta candidata sí prepara conversaciones al WhatsApp confirmado, incluye la identidad legal y está configurada para el dominio final. La vista de opiniones mantiene su cartel de demostración y sus contactos desactivados; no se modificó.

Se añadieron formatos GitHub/Vercel, scripts sin dependencias, CI solo de validación, documentación, pruebas y manifiesto. No se añadieron identidades Sites, metadatos Git, secretos ni enlaces al dominio ajeno de Assulshop.
