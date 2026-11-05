# Publicación y recuperación

## Destino verificado

- Dominio autorizado: `www.assulautorizadapeças.com.br` (ASCII: `www.xn--assulautorizadapeas-myb.com.br`). Canonical, OG y sitemap ya usan este dominio.
- Proyecto Vercel: **assul-site**, equipo **Assul's projects** (`assuls-projects`).
- Repositorio conectado: `https://github.com/arturojaa96-ship-it/Assul-Site.git`; rama de producción `main`.
- Dominio asociado a Production y con configuración válida.
- Configuración observada: Framework Preset **Other**, Root Directory vacía, Node.js **24** y ningún override de compilación.
- La cuenta propietaria de GitHub y la asociación entre repositorio, proyecto y dominio se comprobaron en sus interfaces.

Se prepara la sustitución dentro del mismo repositorio y proyecto, sin cambiar el dominio ni DNS. Las pruebas locales pasaron. La publicación de esta candidata y su comprobación en producción todavía están pendientes.

## Sustitución dentro del mismo repositorio

1. Consulte otra vez el HEAD remoto. Si cambió desde el respaldo, guarde un nuevo respaldo antes de tocarlo.
2. Use un checkout nuevo del repositorio confirmado. Reemplace su árbol de trabajo por estos archivos sin sustituir sus metadatos Git. Revise la eliminación del backend heredado y de todos los activos antiguos no necesarios.
3. Compruebe `npm run check`, `npm run smoke`, el diff y la lista de archivos antes de confirmar el commit.
4. Mantenga el proyecto Vercel verificado con Framework Preset **Other**, Root Directory vacía y Node.js **24**. `vercel.json` declara Output Directory **public** y Build Command **npm run check**. No necesita instalación ni variables de entorno.
5. Tras el commit/push autorizado a la rama `main`, espere a que el despliegue termine. No lo considere publicado solo porque empezó el build.
6. Compruebe el dominio autorizado: página nueva, CNPJ, WhatsApp 5877, CSS/imágenes, móvil, privacidad y canonical. Verifique 404 en `/api/comments`, `/server.js`, `/.git/config` y `/.env`; si hubiera una respuesta inesperada, no imprima su cuerpo.

No se sirve la raíz del repositorio: únicamente `public/`. El directorio raíz `api/` tampoco debe existir, pues Vercel puede detectar funciones aunque estén fuera de la salida estática. No reutilice el rewrite antiguo `/api/(.*)` a `/server.js`.

## Respaldo y rollback

Se creó y verificó un respaldo del repositorio antes de cualquier sustitución:

- Fuente `main`: `45e974cfd9793dc8e895aef08634778546c12053`.
- Despliegue previo de Vercel: [8hHKCkRYwgP2T9YK6oi6PsMkexaK](https://vercel.com/assuls-projects/assul-site/8hHKCkRYwgP2T9YK6oi6PsMkexaK).
- Bundle local externo: `Assul-Site-before-replacement.bundle` (5.168.040 bytes), conservado fuera del paquete y del repositorio que se publicará.
- SHA-256 del bundle: `4f8a59be5be3b297402060ace0f01107b5192960fac159bdbc6a437b8d88c154`.
- Captura: `2026-11-05T13:01:42Z`. `git bundle verify` pasó.

Para restaurar un checkout local use un directorio nuevo:

```text
git clone /ruta/Assul-Site-before-replacement.bundle assul-restauracion
```

Si la nueva publicación falla, restaure el despliegue previo registrado desde Vercel. Para revertir código, prefiera un commit de reversión revisado en el mismo repositorio; no haga force push ni reescriba historial. Este bundle respalda el repositorio, no la configuración privada ni los datos de servicios externos.
