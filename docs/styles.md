# Estilos: ITCSS, BEMIT y temas

Entra en la fase 4. Ver [plan.md](plan.md).

## Las siete capas

Orden de cascada, de menor a mayor especificidad. Lo garantiza `@layer` nativo de
CSS, no el orden de importacion.

| Capa         | Emite CSS | Contenido                                                        |
| ------------ | --------- | ---------------------------------------------------------------- |
| 1 settings   | No        | Escalas, breakpoints, mapas de tokens                            |
| 2 tools      | No        | Mixins y funciones                                               |
| 3 generic    | Si        | Reset y **la emision de las custom properties**                  |
| 4 elements   | Si        | Etiquetas desnudas: `body`, titulos, `input`. Aqui vive el fondo |
| 5 objects    | Si        | Patrones de maquetacion sin identidad visual, prefijo `o-`       |
| 6 components | Si        | Co-locados junto al `.jsx`, prefijo `c-`                         |
| 7 utilities  | Si        | Anulaciones de una sola propiedad, prefijo `u-`                  |

Las capas 1 a 5 y la 7 viven en `src/styles/`. La 6 se queda junto al componente.

**Por que el `:root` no puede vivir en settings.** Hoy `_variables.scss` emite un
bloque `:root` y lo hacen `@use` 23 hojas de estilo. Vite compila cada `.scss`
co-locado como una unidad independiente, asi que ese bloque acaba emitido 23 veces
en el bundle. Ademas rompe la premisa de ITCSS de que settings no emite ni un byte.
Las custom properties se emiten una sola vez, desde `generic/_custom-properties.scss`.

## BEMIT

`ExerciseCard.jsx` usa `_exercise-card.scss` y su bloque es `.c-exercise-card`.

| Prefijo       | Significa                                                         |
| ------------- | ----------------------------------------------------------------- |
| `o-`          | Objeto de maquetacion, reutilizable, sin identidad visual         |
| `c-`          | Componente                                                        |
| `u-`          | Utilidad. Anula una sola propiedad                                |
| `is-`, `has-` | Estado temporal. Nunca se estiliza suelto: siempre `.c-x.is-open` |
| `js-`         | Gancho de JavaScript. **No lleva estilos jamas**                  |

Vocabulario cerrado de estados: `is-selected`, `is-active`, `is-open`, `is-loading`.

El nombre del bloque coincide siempre con el del archivo y el del componente. Hoy no
se cumple: `RoutineExerciseCard.jsx` usa `.routine-ex-card`, y `exercise-list__empty`
se usa fuera de `.exercise-list`.

Anidamiento maximo de un nivel con `&`. El patron plano `.bloque__elemento` que ya
usa el proyecto es el correcto y se conserva.

## Tokens en dos niveles

**Primitivos**: la escala de color cruda. No cambian con el tema y no se consumen
directamente en los componentes.

**Semanticos**: describen un rol, no un color. Son los unicos que se consumen, y son
los unicos que el tema reasigna.

Regla de consumo: un componente escribe `var(--color-accent)`, nunca
`var(--blue-600)` y nunca un hex.

### Fondo y superficies

| Token                    | Claro                    | Oscuro                   |
| ------------------------ | ------------------------ | ------------------------ |
| `--color-bg`             | `#eff6ff`                | `#0b1220`                |
| `--color-bg-mid`         | `#dbeafe`                | `#111c33`                |
| `--color-surface`        | `rgba(255,255,255,0.62)` | `rgba(226,232,240,0.08)` |
| `--color-surface-strong` | `rgba(255,255,255,0.78)` | `rgba(226,232,240,0.11)` |
| `--color-surface-solid`  | `#f1f7ff`                | `#1c2331`                |

El oscuro no es negro: es azul-pizarra desplazado al azul (B=32 sobre R=11), para
que la identidad de marca siga leyendose.

`--color-surface` **sube de 0.20 a 0.62 en claro**. A 0.20 el texto secundario daba
2,69:1 y no llegaba a AA. Es un cambio obligado, no estetico.

`--color-surface-solid` existe para el `@supports not (backdrop-filter)` y para el
PDF de la fase 8.

### Texto

| Token                    | Claro     | Oscuro    |
| ------------------------ | --------- | --------- |
| `--color-text`           | `#0f172a` | `#e8eef9` |
| `--color-text-secondary` | `#475569` | `#b8c6da` |
| `--color-text-muted`     | `#52627a` | `#a8b8cf` |

`#94a3b8`, el `$color-text-muted` actual, **se elimina del sistema**: da 1,88:1 sobre
la superficie clara. Es ilegible.

### Acento y roles

Cada rol tiene tres tokens: el relleno, el texto sobre superficie y la tinta sobre el
relleno. No es redundancia: en claro el texto debe ser mas oscuro que el relleno, y
en oscuro mas claro.

| Token                        | Claro     | Oscuro    |
| ---------------------------- | --------- | --------- |
| `--color-accent`             | `#2563eb` | `#60a5fa` |
| `--color-accent-text`        | `#1d4ed8` | `#93c5fd` |
| `--color-on-accent`          | `#ffffff` | `#0b1220` |
| `--color-danger`             | `#dc2626` | `#f87171` |
| `--color-danger-text`        | `#b91c1c` | `#fca5a5` |
| `--color-success`            | `#047857` | `#34d399` |
| `--color-success-text`       | `#065f46` | `#6ee7b7` |
| `--color-warning`            | `#b45309` | `#fbbf24` |
| `--color-focus`              | `#1d4ed8` | `#93c5fd` |
| `--color-border-interactive` | `#64748b` | `#9fb0c7` |

**El rojo deja de ser color de marca y pasa a ser solo color de peligro.** El acento
es el azul. La prueba esta en el propio codigo: las tres sombras del sistema ya
estan tintadas en `rgba(59,130,246,...)` y el fondo son cuatro orbes azules. El rojo
era un injerto.

## Contrastes medidos

Metodo: composicion alfa real de la superficie sobre el **peor punto** del fondo
(donde los cuatro orbes se solapan), no sobre el fondo ideal. Es la unica forma
honesta de auditar glassmorphism, y explica la observacion de la auditoria de que
"el mismo componente es legible arriba a la derecha e ilegible arriba a la izquierda".

Superficie compuesta de peor caso: `#d2e3fd` en claro, `#2a3f61` en oscuro.

| Par                              | Claro   | Oscuro | Umbral |
| -------------------------------- | ------- | ------ | ------ |
| Texto principal sobre superficie | 13,77:1 | 9,04:1 | 4,5    |
| Texto secundario                 | 5,85:1  | 6,08:1 | 4,5    |
| Texto apagado                    | 4,78:1  | 5,23:1 | 4,5    |
| Acento como texto                | 5,17:1  | 5,84:1 | 4,5    |
| Blanco sobre acento              | 5,17:1  | 7,36:1 | 4,5    |
| Peligro como texto               | 4,99:1  | 5,55:1 | 4,5    |
| Borde de control                 | 3,67:1  | 4,77:1 | 3,0    |
| Anillo de foco                   | 5,17:1  | 5,84:1 | 3,0    |

Todos pasan AA. Los valores se eligieron **por medicion**, corrigiendo los que
fallaban:

| Valor actual                         | Ratio               | Corregido a       | Ratio  |
| ------------------------------------ | ------------------- | ----------------- | ------ |
| `--glass-bg` al 0.20                 | secundario a 2,69:1 | 0.62              | 5,85:1 |
| `$color-text-secondary: #64748b`     | 2,69:1              | `#475569`         | 5,85:1 |
| `$color-text-muted: #94a3b8`         | 1,88:1              | `#52627a`         | 4,78:1 |
| `$color-success: #10b981` con blanco | 3,77:1              | `#047857`         | 5,48:1 |
| `$color-danger: #ef4444` como texto  | 3,29:1              | `#b91c1c`         | 4,99:1 |
| Foco `box-shadow` alfa 0.08          | invisible           | anillo solido 2px | 5,17:1 |

**Dos restricciones que hay que respetar.** El acento y el peligro como texto de
cuerpo solo valen **sobre una superficie, nunca sobre el fondo desnudo**: `#1d4ed8`
sobre `#89b6fa` cae a 3,25:1. En la practica todo el texto vive dentro de tarjetas,
asi que no obliga a rediseñar nada.

El boton flotante si flota sobre el fondo desnudo, y ahi el acento cae a 2,50:1,
por debajo del 3:1 que exige WCAG 1.4.11. Correccion: lleva
`border: 1px solid var(--color-accent-strong)`, que da 3,25:1.

## Glassmorphism en oscuro

En oscuro el vidrio no es blanco translucido. Los `rgba(255,255,255,x)` se invierten
a `rgba(226,232,240,0.08)`, y las sombras pasan a ser mas oscuras y menos difusas.

Hoy hay 23 elementos con `backdrop-filter` y **ningun fallback**. Se anade
`@supports not (backdrop-filter: blur(1px))` con las superficies solidas.

## Conmutacion de tema

Tres estados: `light`, `dark` y `system`. Se escribe `data-theme` en `<html>`,
se persiste en `lomito-train-settings`, y `system` sigue a `prefers-color-scheme`.

Un script inline en `index.html` aplica el tema **antes del primer pintado**, para
evitar el destello de tema incorrecto. Tambien se actualiza
`<meta name="theme-color">`, que hoy esta fijo en `#f8faff`, y se declara
`color-scheme` para que los controles nativos y las barras de scroll acompanen.

## Estilos en linea

Hay 14 `style={{...}}` en el JSX. Un estilo en linea gana a cualquier regla de autor
sin `!important`, asi que ningun bloque `[data-theme="dark"]` podra corregirlos.

Los que llevan color se sustituyen por el patron que **ya existe en el repositorio**:
`WorkoutDayCard.jsx` inyecta `style={{ '--day-color': day.color }}` y deja que el
SCSS decida. Eso es correcto y se generaliza.

Los hex guardados en localStorage (colores de rutina, colores de grupo muscular)
migran a ids de token en la fase 3, porque un hex fijo no puede adaptarse al tema.

## Duplicacion pendiente

Hay bloques de reglas repetidos literalmente en dos y tres archivos, y ya han
divergido: el input de `WorkoutDayForm.scss` usa un padding distinto al de
`ExerciseDetail.scss` y encima centra el texto. En modo oscuro habria que corregir
las seis copias por separado.
