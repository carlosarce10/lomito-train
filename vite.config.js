import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/** Resuelve una ruta dentro de src/ a partir de este archivo. */
const src = (path) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

const ONE_YEAR = 60 * 60 * 24 * 365;

export default defineConfig({
  // Rutas relativas en el build: con enrutado por hash, index.html es siempre la
  // entrada, asi que el dist funciona igual en la raiz del dominio que en una
  // subcarpeta, sin tener que saber donde se va a publicar.
  base: './',
  plugins: [
    react(),
    // Service worker para que la aplicacion abra sin red. Solo existe en el build:
    // en desarrollo el modulo virtual es un no-op y no se registra nada, porque un
    // service worker sirviendo codigo viejo en dev es una tarde perdida.
    // Estrategia y flujo de actualizacion en docs/pwa.md.
    VitePWA({
      // El manifest y los iconos viven en public/ y el navegador los lee por URL
      // fija. El plugin solo genera el service worker.
      manifest: false,
      // El registro lo hace src/services/pwa/serviceWorker.js, que ademas avisa a
      // la interfaz. Un script inyectado no podria.
      injectRegister: false,
      // La version nueva espera a que el usuario la acepte. Con autoUpdate el
      // service worker nuevo tomaria el control con la pagina vieja abierta, y el
      // siguiente import() diferido (PDF, Excel) pediria un chunk con un hash que ya
      // no existe en el servidor.
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Los dos iconos grandes solo los pide el sistema al instalar la aplicacion.
        // Guardarlos en la cache costaria 300 kB que nadie leeria sin conexion.
        globIgnores: ['**/icon-512.png', '**/icon-maskable-512.png'],
        runtimeCaching: [
          {
            // La hoja de estilos de Google Fonts cambia con el navegador: se sirve
            // de la cache y se renueva por detras.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: ONE_YEAR },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Los archivos de fuente llevan hash en la URL y no cambian nunca.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: ONE_YEAR },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    // Vite solo sustituye cuando el id es igual a la clave o empieza por clave + '/',
    // asi que '@' no captura '@shared/...' y el orden no importa.
    // @i18n se anade en la fase 6: ver docs/plan.md.
    alias: {
      '@': src(''),
      '@app': src('app'),
      '@domain': src('domain'),
      '@features': src('features'),
      '@i18n': src('i18n'),
      '@services': src('services'),
      '@shared': src('shared'),
      '@styles': src('styles'),
      '@theme': src('theme'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Permite '@use "shared/styles/variables"' desde cualquier profundidad.
        // Se usa loadPaths y no additionalData: additionalData inyecta el mismo
        // codigo en cada archivo compilado, que es justo lo que hoy hace que el
        // bloque :root se emita 23 veces.
        loadPaths: [src('')],
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
