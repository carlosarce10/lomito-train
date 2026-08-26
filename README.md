# Lomito Train

Registro de entrenamiento de fuerza que funciona sin cuenta, sin red y sin backend.
El usuario mantiene su propio catalogo de ejercicios, los agrupa en rutinas y anota
series con peso y repeticiones.

Los datos viven solo en el dispositivo, en `localStorage`. No hay servidor y no hay
sincronizacion: por eso exportar los datos es parte del producto, no un extra.

## Puesta en marcha

```bash
npm install
npm run dev
```

El servidor escucha en el puerto 5173 y acepta conexiones desde la red local, para
poder abrirlo desde el movil durante el desarrollo.

## Comandos

| Comando            | Que hace                                                            |
| ------------------ | ------------------------------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo                                              |
| `npm run build`    | Build de produccion en `dist/`                                      |
| `npm run preview`  | Sirve el build de produccion                                        |
| `npm run lint`     | ESLint                                                              |
| `npm run lint:css` | Stylelint                                                           |
| `npm run format`   | Prettier en modo escritura                                          |
| `npm run check`    | Formato, ESLint, Stylelint y build. Puerta unica antes de commitear |

## Stack

React con Vite, Sass, iconos Material Design y `uuid`. Sin TypeScript: la seguridad
de tipos se resuelve con validacion en tiempo de ejecucion. Las versiones exactas
estan en `package.json`.

## Documentacion

| Documento                          | Para que                                                               |
| ---------------------------------- | ---------------------------------------------------------------------- |
| [PRODUCT.md](PRODUCT.md)           | Que es el producto, para quien y con que restricciones                 |
| [CLAUDE.md](CLAUDE.md)             | Contexto tecnico: vocabulario, estructura, convenciones y reglas duras |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Commits, atribucion y flujo de trabajo                                 |
| [docs/roadmap.md](docs/roadmap.md) | Que parte de la arquitectura objetivo ya es real                       |

Antes de escribir codigo se lee CLAUDE.md. Antes de escribir un commit se lee
CONTRIBUTING.md.
