# Estado de la migracion

CLAUDE.md describe adonde va el proyecto. Este archivo dice por donde va.
Se actualiza en el mismo commit que cierra cada fase.

## Resumen

| Fase | Nombre                                 | Estado     |
| ---- | -------------------------------------- | ---------- |
| 0    | Limpieza y suelo firme                 | Completada |
| 1    | Alias de importacion                   | Pendiente  |
| 2    | Capa de dominio y almacenamiento       | Pendiente  |
| 3    | Renombrado a `routines` y migracion v3 | Pendiente  |
| 4    | ITCSS, BEMIT y tokens                  | Pendiente  |
| 5    | Enrutado y pagina de ajustes           | Pendiente  |
| 6    | Internacionalizacion                   | Pendiente  |
| 7    | Validacion visible y accesibilidad     | Pendiente  |
| 8    | Exportacion a PDF y Excel              | Pendiente  |

## Lo que es cierto hoy

```
src/
  App.jsx, main.jsx
  app/                    bootstrap + components/ThemeToggle
  domain/                 catalogs/ model/ schemas/ validation/ storage/
  features/exercises/     index.js + pages/ + components/ + hooks/
  features/routines/      index.js + pages/ + components/ + hooks/
  shared/                 components/ + hooks/
  styles/                 las siete capas de ITCSS
  theme/                  themes + applyTheme + useTheme
```

Todavia **no existen**: `src/services/` y `src/i18n/`.

Estado de las reglas duras de CLAUDE.md:

| Regla                               | Estado                             |
| ----------------------------------- | ---------------------------------- |
| 4 (localStorage solo en el dominio) | **Vigente**, impuesta por ESLint   |
| 5 (ninguna clave literal)           | **Vigente**                        |
| 6 (validar antes de escribir)       | **Vigente**                        |
| 7 (ningun error silenciado)         | **Vigente**, `no-empty` como error |
| 8 (migraciones verificadas)         | **Vigente**                        |
| 9 (alias siempre)                   | **Vigente**, impuesta por ESLint   |
| 11 (el dominio no importa React)    | **Vigente**, impuesta por ESLint   |
| 1 (nada de texto en el JSX)         | Objetivo. Fase 6                   |
| 2, 3 (colores y estilos en linea)   | Objetivo. Fase 4                   |
| 10 (features aisladas)              | Objetivo. Fase 3                   |
| 12 (nombre de bloque BEM)           | Objetivo. Fase 4                   |

`no-restricted-properties` sigue desactivada en un unico archivo,
`src/domain/storage/driver.js`, que es el contrato: es el unico modulo que puede
tocar `localStorage`.

## Fase 0 — Limpieza y suelo firme (completada)

- Eliminado `src/sessions/` completo (9 archivos, 882 lineas). Nunca estuvo montado:
  `App.jsx` solo renderizaba `ExercisesPage` y `RoutinesPage`. Decidido en
  PRODUCT.md.
- Eliminado `src/exercises/services/exerciseStorage.js`, un servicio que no importaba
  nadie.
- Corregido el unico error que hacia fallar `npm run lint`
  (`react-hooks/set-state-in-effect` en `ExercisesPage.jsx`): el efecto que limpiaba
  la seleccion era redundante, porque el ejercicio abierto ya se resuelve a `null`
  solo.
- Anadidos Prettier, EditorConfig, Stylelint, ESLint ampliado (react, jsx-a11y,
  import-x, unused-imports), husky, lint-staged y commitlint.
- Corregidos los defectos de accesibilidad que destapo `jsx-a11y`:
  - `Modal` pasa a tener `role="dialog"`, `aria-modal`, cierre con Escape, confinado
    de foco, devolucion del foco al cerrar, y un fondo que es un `<button>` real en
    lugar de un `<div>` con `onClick`.
  - `autoFocus` sustituido por `data-autofocus`, que resuelve el confinador de foco
    del dialogo. `autoFocus` mueve el foco sin que el usuario haya hecho nada.
  - Los grupos de botones de seleccion (grupos musculares, equipamiento, color) pasan
    de `<label>` mas `<div>` a `<fieldset>` mas `<legend>`, con `aria-pressed` para
    que se anuncie el estado.
- Corregido un defecto real que destapo Stylelint: `BottomNav.scss` declaraba
  `safe-area-inset-bottom`, que no es una propiedad CSS. Ademas el `padding-bottom`
  del area segura se descontaba de la altura fija por `box-sizing: border-box`, lo
  que aplastaba la barra en iPhone, y `Layout.scss` no reservaba ese espacio, con lo
  que el ultimo elemento quedaba bajo el indicador de inicio.
- Sustituido `word-break: break-word`, obsoleto, por `overflow-wrap: break-word`.

## Fase 1 — Alias de importacion (completada)

- Alias `@/` y `@shared/` declarados en `vite.config.js`, `jsconfig.json` y el
  resolver de ESLint, que son los tres sitios que deben coincidir.
- Reescritos los imports que salian de la carpeta del componente. `'../algo'` se
  conserva: dentro de la feature sigue siendo local y legible.
- `no-restricted-imports` rechaza subir dos o mas niveles.
- En SCSS se usa `loadPaths` y no `additionalData`, que inyectaria el mismo codigo
  en cada archivo compilado.

## Fase 2 — Capa de dominio y almacenamiento (completada)

Se crea `src/domain/` (sin React, impuesto por lint) con catalogos, modelo,
esquemas, validacion y almacenamiento, mas `src/app/bootstrap`.

Defectos cerrados, todos verificados en navegador:

| Defecto                                             | Como se cerro                                                                                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Los inputs guardaban 0 al escribir una coma decimal | `parseDecimal` acepta coma y punto, y `NumberField` conserva el texto crudo mientras se escribe. Verificado: se teclea `22,5` y se guarda `22.5` |
| Un valor fuera de rango se guardaba igual           | `updateSet` devuelve `{ ok: false, issue }` y no escribe. Verificado con 99999                                                                   |
| `runMigrations` sellaba la version sin migrar       | Registro ordenado, `CURRENT_VERSION` derivada de la lista, sellado dentro del bucle, y aborta si la version guardada es superior                 |
| Las escrituras fallaban en silencio                 | `driver.js` devuelve `{ ok, error }`. El store revierte el snapshot si la escritura fallo, para que la pantalla no muestre lo que no se guardo   |
| Borrar un ejercicio dejaba ids huerfanos            | `deleteExercise` borra en cascada, y el bootstrap sanea lo que dejaron versiones anteriores. Verificado                                          |
| Dos pestanas se pisaban el array entero             | Store unico por clave con `useSyncExternalStore` y escucha de `storage`. Verificado: una pestana anade y la otra lo ve sin recargar              |
| Un dato malformado dejaba la pantalla en blanco     | `ErrorBoundary` mas `RecoveryScreen`, que ofrece descargar el volcado crudo antes de tocar nada                                                  |
| `equipment` se perdia al crear un ejercicio         | `createExercise` lo persiste. Verificado                                                                                                         |
| `updateWorkoutDay` era inalcanzable                 | Conectado: hay boton de editar en el detalle de la rutina. Verificado                                                                            |
| Los nombres admitian caracteres invisibles          | `normalizeText` los elimina y colapsa espacios. Verificado                                                                                       |

Decision de diseno que salio de la propia verificacion: un elemento con una parte
corrupta **se repara, no se descarta**. Una rutina con una referencia invalida es
una rutina con una referencia menos, no una rutina perdida. La primera version
rechazaba la rutina entera, que era peor que el problema original.

Retirados: `useLocalStorage`, `storageUtils`, `migrations` antiguo, `useSearch` y
las tres carpetas `constants/`.

## Fase 3 — Renombrado a routines y migracion v3 (completada)

El mismo concepto se llamaba de cuatro formas: la carpeta decia `workout-days`, el
archivo `RoutinesPage.jsx`, el bloque CSS `.routines-page`, el hook
`useWorkoutDays` y la clave `lomito-train-workout-days`.

Estructura: `src/features/{exercises,routines}` con `index.js` como unica API
publica. `muscle-groups` se disuelve: su catalogo ya estaba en el dominio y sus dos
componentes pasan a la feature `exercises`. `routines` depende de `exercises`, que
es la unica direccion permitida entre features, y lo impone ESLint.

Migracion v2 a v3, verificada en navegador con datos v2 reales:

| Cambio                                          | Resultado verificado                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| `muscleGroup` + `categories` a `muscleGroupIds` | `['push','upperbody']` conservados; los campos viejos desaparecen del objeto |
| `equipment` a `equipmentId`                     | `'barbell'`, y `null` donde antes habia cadena vacia                         |
| `color` hexadecimal a `colorId`                 | `#34d399` a `mint`; un `#ff00ff` fuera de paleta cae al color por defecto    |
| `updatedAt` en rutinas y donde faltaba          | Rellenado desde `createdAt`                                                  |
| Clave de rutinas renombrada                     | `-workout-days` borrada solo despues de verificar que `-routines` se lee     |
| Claves del modulo de sesiones                   | Borradas                                                                     |

Ademas, la tarjeta de ejercicio pinta **todos** los grupos musculares, no solo el
primero. El usuario seleccionaba tres, veia el contador "(3)" y luego una sola
etiqueta. Las etiquetas van en su propia fila: en la misma linea que el nombre, un
ejercicio con dos grupos truncaba el titulo en pantalla estrecha.

Dos defectos propios que destapo la verificacion, no el build:

1. **Perdida total de datos.** Los repositorios se crean al importar el modulo, es
   decir antes de que corran las migraciones, asi que decodificaban datos v2 contra
   esquemas v3 y devolvian una lista vacia. El paso de consolidacion del arranque
   escribia despues esa lista vacia encima de los datos ya migrados. Corregido con
   una relectura explicita tras migrar, y con la regla de que la consolidacion
   **nunca escribe si eso reduce el numero de elementos**: que la validacion rechace
   algo es motivo para avisar, jamas para borrarlo del disco.
2. **Recursion infinita.** El renombrado masivo dejo los callbacks del hook con el
   mismo nombre que las funciones de dominio que importaban. Se importan con
   namespace (`model.addExerciseToRoutine`) para que no pueda repetirse.

## Fase 4 — ITCSS, BEMIT y tokens (completada)

`src/styles/` con las siete capas. El orden de la cascada lo fija `@layer` nativo en
`_layers.scss`. Un componente consume una sola cosa: `@use 'styles/foundation' as *`,
que reexporta settings y tools, las dos capas que no emiten CSS.

| Defecto                                                   | Resultado                                                                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| El bloque `:root` se emitia 23 veces                      | Se emite 4 veces desde un unico archivo: claro, sistema-oscuro, y las dos elecciones explicitas       |
| 166 colores literales en los componentes                  | Cero. Verificado por grep en cada commit                                                              |
| El fondo hardcodeado en el reset, divergido de los tokens | Vive en `elements/_page.scss` y sale de tokens                                                        |
| Bloques BEM que no coincidian con su componente           | Los 22 llevan `c-` y coinciden. Verificado cruzando las clases del JSX contra los selectores del SCSS |
| 23 elementos con `backdrop-filter` sin respaldo           | Los mixins de vidrio traen `@supports` con superficie opaca                                           |
| El foco era un `box-shadow` al 8% de opacidad             | Anillo solido de 2px con `--focus`, 5,17:1                                                            |
| `--glass-bg` al 0.20 dejaba el texto secundario en 2,69:1 | Superficie al 0.62: 5,85:1. Por eso las tarjetas se ven mas opacas                                    |
| El rojo era la marca                                      | Es solo `--danger`. El acento es azul, que es lo que ya emitian el fondo y las tres sombras           |

Tema con tres estados, `data-theme` en el raiz, persistencia en
`lomito-train-settings`, seguimiento de `prefers-color-scheme` en vivo y
`meta[name=theme-color]` sincronizado desde el propio token. Script en linea en
`index.html` que lo aplica antes del primer pintado. Boton en la cabecera que rota
entre los tres estados: no espera a la pagina de ajustes de la fase 5 porque una
funcion escrita y no conectada es deuda.

Verificado en navegador: rota los tres estados, persiste, la barra del navegador
sigue al tema, `system` cambia en vivo con el sistema, y una eleccion explicita de
claro **gana** a un sistema en oscuro, que es lo que hace la guarda
`:root:not([data-theme='light'])`.

Tres defectos propios que destapo la verificacion:

1. **Se perdio todo el espaciado.** Vite inyecta el CSS de cada `.scss` co-locado en
   el orden en que se importa su modulo. Con `App.jsx` importado antes que
   `styles/main.scss`, el navegador veia un `@layer components` antes de que
   `_layers.scss` declarase el orden, y **una capa ya creada no se puede reordenar**:
   el reset le ganaba a los componentes y `padding` quedaba en 0. El CSS se importa
   ahora antes que cualquier componente.
2. **Ocho sitios usaban un token de relleno como color de texto.** `--accent` sobre
   la superficie de vidrio da 4,14:1 en oscuro y no pasa AA; `--accent-text` da
   5,84:1. Los encontro la fase de revision adversarial.
3. **El boton flotante quedaba por debajo de la barra inferior** (`z-index: 40`
   contra 50). Ahora usa `$z-fab`.

El minimo de 44 por 44 se resuelve con `touch-target-extended`, que amplia el area
pulsable con un pseudo-elemento sin cambiar el tamano visible: un boton de borrar de
24px dentro de una fila de tabla no puede crecer a 44 sin romper la rejilla.

## Deuda conocida, pendiente de fase

Hallazgos confirmados por la auditoria que siguen vivos en el codigo:

| Deuda                                                                         | Fase que la cierra |
| ----------------------------------------------------------------------------- | ------------------ |
| `runMigrations` sella `schemaVersion` aunque la migracion no se ejecute       | 2                  |
| Las escrituras a localStorage tragan el error en silencio                     | 2                  |
| Borrar un ejercicio deja ids huerfanos en las rutinas para siempre            | 2                  |
| `useLocalStorage` no escucha `storage`: dos pestanas se pisan el array entero | 2                  |
| `useExercises` se instancia dos veces sobre la misma clave                    | 2                  |
| Sin `ErrorBoundary`: un dato malformado deja la pantalla en blanco            | 2                  |
| El campo `equipment` se descarta al crear un ejercicio                        | 2                  |
| `muscleGroup` y `categories` son el mismo dato duplicado                      | 3                  |
| `updateWorkoutDay` es inalcanzable: no se puede renombrar una rutina          | 3                  |
| El tema esta partido entre variables Sass y custom properties                 | 4                  |
| El bloque `:root` se re-emite en los 23 stylesheets que lo usan               | 4                  |
| El fondo de la aplicacion esta hardcodeado en el reset                        | 4                  |
| 19 hex y 64 `rgba()` literales incrustados en los componentes                 | 4                  |
| Bloques de reglas duplicados en dos y tres archivos                           | 4                  |
| Sin capas ITCSS: el orden de cascada depende del orden de importacion         | 4                  |
| Los inputs numericos guardan 0 al escribir una coma decimal                   | 7                  |
| El swipe no maneja `touchcancel`: un toque posterior dispara Eliminar         | 7                  |
| `preventDefault` en `onTouchMove` no tiene efecto: React lo registra pasivo   | 7                  |

## Como se lee este archivo

Una fila en "Pendiente" significa que el codigo **no** cumple todavia la regla
correspondiente de CLAUDE.md. No es una invitacion a saltarsela en codigo nuevo: lo
que se escriba a partir de ahora sigue la regla, y lo antiguo se migra en su fase.
