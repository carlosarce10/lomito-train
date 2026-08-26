# CLAUDE.md

Contexto permanente de Lomito Train. Se lee antes de tocar nada.
El porque y el para quien no estan aqui: estan en [PRODUCT.md](PRODUCT.md).

## 1. Que es Lomito Train

Registro de entrenamiento de fuerza. El usuario mantiene su propio catalogo de
ejercicios, los agrupa en rutinas y anota series con peso y repeticiones.

Sin cuenta, sin red, sin backend. La persistencia unica es localStorage, y por eso
exportar los datos no es una funcion accesoria: es la unica copia de seguridad que
existe.

## 2. Comandos

| Comando            | Que hace                                                                |
| ------------------ | ----------------------------------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo en el puerto 5173, accesible desde la red local  |
| `npm run build`    | Build de produccion en `dist/`                                          |
| `npm run preview`  | Sirve el build de produccion                                            |
| `npm run lint`     | ESLint sobre todo el repositorio                                        |
| `npm run lint:css` | Stylelint sobre `src/**/*.scss`                                         |
| `npm run format`   | Prettier en modo escritura                                              |
| `npm run check`    | Formato, ESLint, Stylelint y build. **Puerta unica antes de commitear** |

`npm run check` tiene que pasar en verde antes de cada commit. El hook de pre-commit
solo revisa los archivos preparados; `check` revisa el proyecto entero.

## 3. Stack y decisiones tecnicas

React con Vite, Sass, iconos Material Design (`@mdi/js` + `@mdi/react`), `uuid`.
Las versiones exactas estan en `package.json` y no se copian aqui.

| Decision                        | Motivo                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| Sin TypeScript                  | La seguridad de tipos viene de validacion en tiempo de ejecucion en `src/domain/validation` |
| Sass con `@use`                 | `@import` esta obsoleto en Sass. Nunca se usa                                               |
| localStorage como unico almacen | No hay servidor. Por eso exportar es obligatorio, no opcional                               |
| PWA instalable                  | El uso real es en el gimnasio, con mala cobertura                                           |

## 4. Vocabulario canonico

Una sola palabra por concepto, la misma en codigo, carpetas, clases CSS, claves de
traduccion y ambitos de commit. La columna "codigo" manda.

| Concepto                                   | Codigo        | Etiqueta es    | Etiqueta en   |
| ------------------------------------------ | ------------- | -------------- | ------------- |
| Entrada del catalogo del usuario           | `exercise`    | Ejercicio      | Exercise      |
| Grupo de ejercicios que se entrenan juntos | `routine`     | Rutina         | Routine       |
| Fila de peso y repeticiones                | `set`         | Serie          | Set           |
| Peso levantado                             | `weight`      | Peso           | Weight        |
| Repeticiones                               | `reps`        | Repeticiones   | Reps          |
| Grupo muscular (catalogo)                  | `muscleGroup` | Grupo muscular | Muscle group  |
| Equipamiento (catalogo)                    | `equipment`   | Equipamiento   | Equipment     |
| Mejor marca, siempre calculada             | `record`      | Marca          | Personal best |
| Ajustes de la aplicacion                   | `settings`    | Ajustes        | Settings      |
| Tema visual                                | `theme`       | Tema           | Theme         |
| Idioma activo                              | `language`    | Idioma         | Language      |
| Exportacion a PDF o Excel                  | `export`      | Exportar       | Export        |

Palabras prohibidas y su sustituto:

| Prohibido                                      | Se usa                                 |
| ---------------------------------------------- | -------------------------------------- |
| `workoutDay`, `workout-day`, `day`             | `routine`                              |
| `category`, `categories`                       | `muscleGroupIds`                       |
| `session`, `activeSession`, `history`, `timer` | No existen. Se eliminaron del producto |
| `serie` en identificadores                     | `set`                                  |

Si un concepto no esta en esta tabla, se anade a la tabla antes de escribir la
primera linea de codigo.

## 5. Donde va cada cosa

| Voy a anadir                                 | Va en                                               |
| -------------------------------------------- | --------------------------------------------------- |
| Una pantalla                                 | `src/features/<feature>/pages/`                     |
| Un componente que conoce el dominio          | `src/features/<feature>/components/`                |
| Un componente generico (boton, modal, campo) | `src/shared/components/`                            |
| Una regla de negocio o un invariante         | `src/domain/model/`                                 |
| Una lista fija de valores                    | `src/domain/catalogs/`                              |
| Una clave de localStorage                    | `src/domain/storage/keys.js` y en ningun otro sitio |
| Un cambio de forma de los datos              | `src/domain/schemas/` mas su migracion              |
| Texto visible                                | `src/i18n/locales/{es,en}/<namespace>.json`         |
| Un color, un radio, una sombra, un espaciado | `src/styles/settings/`                              |
| Un adaptador a una libreria externa          | `src/services/`                                     |

Anatomia obligatoria de una feature: `index.js` como unica API publica, mas
`pages/`, `components/` y `hooks/`. Un hook de datos y un hook de UI nunca se
mezclan. Dentro de una feature no hay `constants/`, `services/`, `styles/` ni
`utils/`: esos van a la capa que les corresponde.

Barrel files: solo `src/features/<feature>/index.js` y los catalogos del dominio.
Nunca en `components/`, `hooks/` ni `shared/`, porque crean ciclos y rompen el
aislamiento de HMR de Vite.

## 6. Direccion de las dependencias

```
app -> features -> { shared, domain, services, i18n, theme }
features/routines -> features/exercises   (unica dependencia entre features)
domain  -> nada del proyecto salvo domain
shared  -> nada del proyecto salvo shared
```

Esto no es una recomendacion: lo impone ESLint.

## 7. Modelo de datos

Claves de localStorage, todas declaradas en `src/domain/storage/keys.js`:

| Clave                    | Contenido             |
| ------------------------ | --------------------- |
| `lomito-train-meta`      | `{ schemaVersion }`   |
| `lomito-train-exercises` | `Exercise[]`          |
| `lomito-train-routines`  | `Routine[]`           |
| `lomito-train-settings`  | `{ language, theme }` |

Invariantes que ninguna escritura puede romper:

1. `name` normalizado, no vacio, maximo 60 caracteres.
2. Un ejercicio tiene al menos un grupo muscular.
3. `routine.exerciseIds` sin duplicados y sin ids huerfanos.
4. `weight` y `reps` dentro de rango; `reps` siempre entero.
5. `equipmentId` y `colorId` siempre existen en su catalogo.

Reglas del runner de migraciones: es idempotente, verifica cada escritura, nunca
degrada una version superior a la actual, y **no sella la version si alguna
escritura fallo**. Detalle en [docs/data-model.md](docs/data-model.md).

## 8. Estilos

ITCSS con siete capas: settings, tools, generic, elements, objects, components,
utilities. El orden de la cascada lo fija `@layer` nativo en `src/styles/_layers.scss`,
no el orden de importacion.

Las capas 1 a 5 y la 7 viven en `src/styles/`. La 6 se queda junto al componente y
cada archivo se declara a si mismo dentro de `@layer components`.

Un componente consume una sola cosa: `@use 'styles/foundation' as *;`, que reexporta
settings y tools, las dos capas que no emiten CSS. Un componente nunca importa
generic, elements, objects ni utilities.

`src/styles/main.scss` es el unico punto de entrada global y lo importa `src/main.jsx`.

Nomenclatura BEMIT: `ExerciseCard.jsx` usa su `_exercise-card.scss` y su bloque es
`.c-exercise-card`. Prefijos: `o-` objetos, `c-` componentes, `u-` utilidades,
`is-`/`has-` estados, `js-` ganchos de JavaScript sin estilos.

Vocabulario cerrado de estados: `is-selected`, `is-active`, `is-open`, `is-loading`.

Todo color es una custom property de rol semantico, declarada en los dos mapas de
`settings/_tokens.scss` y emitida una sola vez desde `generic/_custom-properties.scss`.
Anadir un token a un tema y no al otro deja ese token sin valor en el otro tema.

Los tokens de relleno y los de texto no son intercambiables: `--accent` es un
relleno y `--accent-text` es el texto sobre superficie. Usar el relleno como texto
en modo oscuro da 4,14:1 y no pasa AA.

El tema tiene tres estados: `light`, `dark` y `system`. Se aplica escribiendo
`data-theme` en el elemento raiz, se persiste en `lomito-train-settings`, y un script
en linea en `index.html` lo aplica antes del primer pintado para que no haya
destello. Ese script es la unica excepcion a la regla 5.
Detalle en [docs/styles.md](docs/styles.md).

## 9. Internacionalizacion

Seis namespaces: `common`, `exercises`, `routines`, `settings`, `catalog`,
`validation`. Convencion de claves: `namespace.componente.concepto`, en minusculas
y separadas por puntos. Nunca la frase como clave.

Los catalogos guardan ids; las etiquetas viven en `catalog.*`.

Numeros, pesos y fechas pasan siempre por `src/i18n/format`. Nunca se instancia
`Intl` con un locale literal. Los plurales se resuelven con `Intl.PluralRules`,
nunca con un ternario. `document.documentElement.lang` sigue al idioma activo.
Detalle en [docs/i18n.md](docs/i18n.md).

## 10. Validacion

Toda entrada del usuario se valida en `src/domain/validation` antes de tocar el
almacenamiento, venga de un formulario, de una importacion o de una migracion.
La interfaz solo muestra el resultado.

Los limites numericos viven en `limits.js` y no se repiten en el JSX.

Regla de decimales: mientras el usuario escribe, el input conserva la cadena cruda;
`parseDecimal` acepta coma y punto. Nunca se convierte a numero en cada pulsacion.
Detalle en [docs/validation.md](docs/validation.md).

## 11. Comentarios y documentacion

Identificadores en ingles. Comentarios y JSDoc en espanol.

Una linea de comentario encima de cada funcion exportada, hook y componente,
diciendo **que** hace y que devuelve, nunca **como** lo hace. En `src/domain/` el
JSDoc con `@param`, `@returns` y `@throws` es obligatorio, porque no hay TypeScript
que declare el contrato.

Prohibido: comentarios que repiten el codigo, bloques decorativos de guiones o
iguales, emojis, iconos, y `TODO` sin una referencia concreta.

Un comentario que explica un porque no obvio vale mas que tres que describen el como.

## 12. Commits y atribucion

Conventional Commits. Asunto en espanol, imperativo, minuscula, sin punto final,
maximo 72 caracteres, sin emojis. El cuerpo explica el porque.

`BREAKING CHANGE:` es obligatorio cuando cambia el esquema persistido.

Los tipos y ambitos permitidos estan en `commitlint.config.js`, que es la fuente de
verdad. El hook `commit-msg` los verifica. Detalle en [CONTRIBUTING.md](CONTRIBUTING.md).

## 13. Reglas duras

1. Ningun texto visible escrito en el JSX. Todo pasa por i18n.
2. Ningun color hexadecimal ni `rgba()` fuera de `src/styles/settings/`.
3. Ningun `style={{ }}` con color, fondo o borde. Si el dato manda el color, se
   inyecta como custom property y decide el SCSS.
4. Ningun acceso a `localStorage` fuera de `src/domain/storage/`.
5. Ninguna clave de almacenamiento escrita como literal.
6. Ninguna escritura de datos del usuario sin validar antes contra su esquema.
7. Ningun error silenciado. `catch {}` vacio esta prohibido: se devuelve
   `{ ok: false, error }` y la interfaz avisa.
8. Ninguna migracion sella la version si alguna escritura fallo.
9. Ningun import con `../../` o superior. Alias siempre.
10. Ninguna feature importa el interior de otra: solo su `index.js`.
11. Ningun archivo de `src/domain/` ni `src/services/` importa React.
12. Ningun bloque BEM con nombre distinto al del archivo y al del componente.
13. Ninguna area interactiva por debajo de 44 por 44 pixeles, ni ningun
    `outline: none` sin un foco visible de reemplazo con contraste 3:1.
14. Ninguna accion destructiva sin confirmacion.
15. Ninguna funcionalidad se deja escrita pero desconectada. Si no se monta, no se
    integra. Esta regla existe porque ya paso: habia 882 lineas de un modulo de
    sesiones que nunca se montaron.
16. Ningun emoji en codigo, comentarios, documentacion ni mensajes de commit.
17. `npm run check` en verde antes de cada commit.

## 14. Estado de la migracion

La estructura descrita en las secciones 5 a 10 es el objetivo acordado, y se alcanza
por fases. El contenido de cada fase esta en [docs/plan.md](docs/plan.md). **Lo que ya es cierto hoy y lo que todavia no** esta en
[docs/roadmap.md](docs/roadmap.md), con la fase en la que entra cada pieza.

Antes de dar por hecho que una carpeta existe, se comprueba. Este archivo describe
adonde va el proyecto; el roadmap dice por donde va.

## 15. Mantenimiento de este archivo

Se actualiza en el mismo commit que cambia lo que describe. Si una seccion pasa de
30 lineas, se mueve a `docs/` y aqui queda un enlace. Nunca se escriben aqui
inventarios de archivos, conteos de lineas, versiones exactas ni fechas. Si una
regla se incumple dos veces, o se automatiza con lint o se retira del documento.
