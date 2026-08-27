# PWA: sin conexion, instalacion e iconos

Vigente desde el cierre de las ocho fases. Ver [roadmap.md](roadmap.md).

El uso real de Lomito Train es en el gimnasio, con mala cobertura o ninguna. Sin
service worker, la aplicacion instalada abria la pagina de error del navegador en
cuanto faltaba la red, aunque todos los datos estuvieran en el dispositivo.

## Que hay y donde

| Pieza                    | Donde                                                 | Quien la lee                   |
| ------------------------ | ----------------------------------------------------- | ------------------------------ |
| Manifest                 | `public/manifest.webmanifest`                         | El navegador, por URL fija     |
| Iconos                   | `public/*.png`, regenerados con `npm run icons`       | El navegador y el sistema      |
| Service worker           | `dist/sw.js`, lo genera `vite-plugin-pwa` en el build | El navegador                   |
| Registro y actualizacion | `src/services/pwa/serviceWorker.js`                   | `main.jsx` y `UpdateBanner`    |
| Instalacion              | `src/services/pwa/installPrompt.js`                   | `InstallPanel`, en Ajustes     |
| Etiquetas para iOS       | `index.html`, las `meta` con prefijo `apple-`         | Safari, que no lee el manifest |

`src/services/pwa/` no conoce React: expone almacenes con la forma que espera
`useSyncExternalStore`, igual que los repositorios del dominio, y la interfaz se
suscribe.

## Sin conexion

Estrategia `generateSW` de Workbox, configurada en `vite.config.js`:

- **Precache** de todo lo que sale del build: HTML, JS, CSS, iconos pequenos y el
  manifest. Incluye los chunks diferidos de PDF y Excel, para poder exportar sin red.
  Se excluyen `icon-512.png` e `icon-maskable-512.png`: solo los pide el sistema al
  instalar, y guardarlos costaria 300 kB que nadie leeria sin conexion.
- **Cache en tiempo de ejecucion** para Google Fonts: la hoja de estilos con
  `StaleWhileRevalidate`, porque cambia segun el navegador, y los archivos de fuente
  con `CacheFirst`, porque llevan hash en la URL. Asi la tipografia es la misma con
  red y sin ella a partir de la segunda visita.
- **`navigateFallback` a `index.html`**. Con enrutado por hash toda navegacion cae
  ahi, asi que solo importa para el `start_url`.
- **Solo en el build.** En `npm run dev` el modulo virtual `virtual:pwa-register` es
  un no-op: no se registra nada. Un service worker sirviendo codigo viejo en
  desarrollo es una tarde perdida buscando un bug que no existe.

`base: './'` se respeta: el service worker se registra como `./sw.js` con ambito
`./`, asi que el `dist` sigue funcionando igual en la raiz del dominio que en una
subcarpeta.

La primera visita con red deja todo en cache y muestra el aviso "ya funciona sin
conexion". A partir de ahi la aplicacion abre sin red, incluida la pantalla de
rescate: el registro se hace antes de decidir si los datos arrancan.

## Actualizaciones

`registerType: 'prompt'`, y no `autoUpdate`, por un motivo concreto. Con
`autoUpdate` el service worker nuevo toma el control mientras la pagina vieja sigue
abierta. El siguiente `import()` diferido, por ejemplo al exportar a PDF, pide un
chunk con un hash que ya no existe en el servidor, y la exportacion falla sin que
nadie entienda por que.

Flujo:

1. Se despliega un build nuevo.
2. El navegador comprueba `sw.js` al abrir la aplicacion. Ademas, mientras la
   aplicacion sigue abierta, `serviceWorker.js` pide una comprobacion cada hora, y
   solo si hay red: sin red el navegador solo comprueba al navegar, y una sesion
   larga no se enteraria nunca.
3. El service worker nuevo se instala y espera. `onNeedRefresh` marca
   `needRefresh` y `UpdateBanner` pinta el aviso con **Actualizar** y **Mas tarde**.
4. Actualizar envia `skipWaiting`; cuando el nuevo toma el control, la pagina se
   recarga. Los datos no corren peligro: viven en localStorage y se escriben en cada
   cambio.
5. Si el usuario no hace nada, la version nueva entra sola en la siguiente apertura
   en frio, cuando no queda ninguna pestana con la vieja.

El banner va dentro del flujo de la pagina y no flotando: la capa flotante ya la
ocupa el toast, y dos capas fijas sobre la barra inferior se pisarian. Como el scroll
vuelve arriba en cada navegacion, el aviso se ve en cuanto se cambia de pantalla.

## Instalacion por plataforma

| Plataforma                              | Como se instala                                               | Que hace la aplicacion                                        |
| --------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| Android con Chrome, Edge o Samsung      | Dialogo nativo, o menu del navegador, Instalar aplicacion     | Retiene `beforeinstallprompt` y ofrece un boton en Ajustes    |
| iPhone y iPad con Safari                | Compartir, Anadir a pantalla de inicio. No hay dialogo ni API | Explica los pasos en Ajustes y declara las `meta` de `apple-` |
| iPhone y iPad con Chrome, Edge, Firefox | Igual que Safari desde iOS 16.4                               | Los mismos pasos                                              |
| Escritorio con Chrome o Edge            | Icono de instalar en la barra de direcciones                  | Boton en Ajustes                                              |
| Escritorio con Firefox                  | No instala aplicaciones web                                   | Pista generica: buscar en el menu del navegador               |

Lo que hay que saber de iOS, porque es donde se pregunta "por que no me deja":

- **No existe el evento `beforeinstallprompt`**, ni ninguna forma de lanzar la
  instalacion desde la pagina. El unico camino es el menu Compartir. Por eso el panel
  de Ajustes no puede ofrecer un boton y ofrece los pasos.
- El nombre bajo el icono sale de `apple-mobile-web-app-title`, no del manifest. Sin
  esa etiqueta se usa el `<title>`.
- El modo pantalla completa sale de `display: standalone` del manifest desde iOS
  16.4, y de `apple-mobile-web-app-capable` en versiones anteriores. Se declaran las
  dos.
- El icono sale de `apple-touch-icon`, que debe ser **opaco**: iOS pinta de negro
  cualquier transparencia y aplica su propia mascara redondeada.
- No hay pantallas de arranque: harian falta imagenes `apple-touch-startup-image`
  por cada tamano de dispositivo. Deuda conocida.

La aplicacion sabe si ya corre instalada por `display-mode: standalone`, mas
`navigator.standalone`, que es lo unico que expone Safari. En ese caso la seccion de
instalacion no se pinta.

## Iconos

El maestro, `assets/logo-master.png`, es un cuadrado de 1254 px con el arte dentro
de un rectangulo redondeado de radio 215 px, fondo crema `rgb(245, 243, 240)`, sobre
**esquinas negras**. Eso explicaba el marco negro que se veia en Android: el icono
maskable se generaba encogiendo el maestro y rellenando con negro, y cualquier
mascara del lanzador dejaba a la vista ese negro.

`npm run icons` (`scripts/build-icons.mjs`, Node puro, sin dependencias) mide el
radio y el color del fondo sobre el propio maestro y genera:

| Archivo                        | Tamano   | Forma                                             | Por que                                                                    |
| ------------------------------ | -------- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| `public/icon-192.png`, `-512`  | any      | El arte con las esquinas **transparentes**        | Lo ven el dialogo de instalacion, el arranque y el escritorio, sin mascara |
| `public/icon-maskable-512.png` | 512      | Crema a sangre, arte reducido a la zona segura    | Android recorta a la forma que decida el lanzador: fondo hasta el borde    |
| `public/apple-touch-icon.png`  | 180      | Crema a sangre, opaco, arte al tamano del maestro | iOS aplica su mascara y pinta de negro la transparencia                    |
| `public/favicon-16.png`, `-32` | any      | Como el icono any                                 | Pestana del navegador                                                      |
| `public/og-image.png`          | 1200x630 | Arte centrado sobre crema, opaco, menos de 300 kB | Vista previa del enlace en WhatsApp, Telegram, Slack y X                   |
| `src/assets/logo-mark.png`     | 96       | Solo la cabeza                                    | Cabecera de la aplicacion: el logotipo completo no se lee a 32 px          |

La zona segura de un icono maskable es un circulo del 80 por ciento del lado. El
maestro entero se escala a ese 80 por ciento, con sus margenes, porque asi la
palabra LOMITO y las orejas quedan justo dentro del circulo; escalar mas dejaria la L
y la O finales bajo la mascara de un lanzador redondo.

El script falla, en vez de generar un icono con marco, si la mascara redondeada del
icono any deja visible algun pixel de las esquinas negras o de su antialias: los
detecta inundando desde los cuatro vertices todo lo que no sea crema.

Los derivados se versionan. Un clon limpio no necesita ejecutar nada; el script se
lanza a mano cuando cambia el maestro.

## Vista previa del enlace

Al compartir la URL, WhatsApp, Telegram, Slack o X piden la pagina y leen las
etiquetas Open Graph de `index.html`: titulo, descripcion e imagen. Dos cosas que
no son obvias y ya han fallado:

- **`og:image` tiene que ser una URL absoluta.** El resto del build usa rutas
  relativas para no saber donde se publica, asi que la base publica vive en `.env`
  como `VITE_SITE_URL` y Vite la sustituye en `index.html` al construir. Si el sitio
  cambia de dominio, se cambia ahi y en ningun otro sitio.
- **Ningun comentario de `index.html` puede contener una etiqueta HTML escrita.** Los
  rastreadores de vistas previas no parsean HTML: buscan la primera aparicion de
  `<title>` con una expresion regular. Un comentario que decia "usaria el <title> de
  la pestana" hizo que WhatsApp mostrara como titulo el final de ese comentario.

WhatsApp ademas descarta imagenes de mas de 300 kB, por eso `npm run icons` reduce el
arte hasta que el PNG cabe. Y cachea la vista previa por URL durante horas: para ver
un cambio hay que compartir la URL con un parametro distinto, por ejemplo `?v=2`.

## Despliegue

El sitio vive en `https://lomito-train.netlify.app`. Se sube el `dist` tal cual: con
enrutado por hash no hacen falta reescrituras. Dos archivos de `public/` existen solo
por el hosting:

- `_headers`: Netlify no conoce la extension `.webmanifest` y servia el manifest
  como `application/octet-stream`. Chrome lo tolera, pero el tipo correcto es
  `application/manifest+json`.
- `.env` (en la raiz, versionado): la URL publica para Open Graph, ver arriba.

Netlify sirve `sw.js` con `max-age=0, must-revalidate`, que es lo que un service
worker necesita para que el navegador vea cada version nueva.

Si alguien no consigue instalar desde la URL publicada, lo primero es saber el
dispositivo: en iPhone no hay boton, es Compartir y Anadir a pantalla de inicio; en
Android con Chrome la opcion esta en el menu de los tres puntos, "Instalar
aplicacion", y el boton de Ajustes aparece en cuanto Chrome dispara
`beforeinstallprompt`. Si la aplicacion ya estaba instalada, el menu muestra "Abrir
Lomito Train" en su lugar.

## Deuda conocida

- `background_color` es el fondo oscuro y `theme_color` el claro. La pantalla de
  arranque de Android usa el primero, asi que alguien con tema claro ve un arranque
  oscuro y un salto a claro. El manifest no puede seguir al tema: hay que decidir
  uno.
- Sin imagenes de arranque para iOS.
- Chrome en Android tarda hasta un dia en aplicar un cambio de nombre o de iconos a
  una aplicacion ya instalada. Para verlo al momento, desinstalar y volver a
  instalar.
