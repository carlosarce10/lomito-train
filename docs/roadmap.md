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

La estructura real de `src/` sigue siendo la original, no la de la seccion 5 de
CLAUDE.md:

```
src/
  App.jsx, main.jsx, App.scss
  exercises/       ExercisesPage + components/ + hooks/ + constants/
  workout-days/    RoutinesPage + components/ + hooks/ + constants/
  muscle-groups/   components/ + constants/
  shared/          components/ + hooks/ + services/ + styles/
```

Todavia **no existen**: `src/domain/`, `src/features/`, `src/services/`, `src/i18n/`,
`src/theme/`, `src/styles/`. Las reglas duras que dependen de ellos (1, 2, 4, 5, 6,
9, 10, 11) describen el objetivo, no el estado actual.

Excepciones activas y documentadas en `eslint.config.js`:

- `no-restricted-properties` esta desactivada en `src/shared/hooks/useLocalStorage.js`
  y `src/shared/services/storageUtils.js`. Ese bloque se borra en la fase 2, en el
  mismo commit que los elimina.

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
