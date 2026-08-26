import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

/** Resuelve una ruta dentro de src/ a partir de este archivo. */
const src = (path) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Vite solo sustituye cuando el id es igual a la clave o empieza por clave + '/',
    // asi que '@' no captura '@shared/...' y el orden no importa.
    // Las carpetas de las capas que aun no existen se anaden segun avanza el plan
    // por fases: ver docs/plan.md.
    alias: {
      '@': src(''),
      '@shared': src('shared'),
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
