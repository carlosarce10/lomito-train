# Guia de contribucion

Convenciones de trabajo de Lomito Train. El contexto tecnico esta en
[CLAUDE.md](CLAUDE.md); el producto, en [PRODUCT.md](PRODUCT.md).

## Antes de empezar

```bash
npm install          # instala tambien las devDependencies y activa los hooks de git
npm run dev
```

El `.npmrc` fija `include=dev`, asi que un clon limpio instala las herramientas de
calidad y el script `prepare` deja los hooks de husky activos sin ningun paso extra.

## Puerta de calidad

```bash
npm run check
```

Ejecuta, en este orden: comprobacion de formato, ESLint, Stylelint y build. Tiene
que pasar en verde antes de cada commit.

El hook de `pre-commit` ejecuta `lint-staged`, que formatea y corrige solo los
archivos preparados. Es rapido a proposito: su trabajo es que el codigo no se
desformatee, no sustituir a `npm run check`.

Si un hook estorba, se arregla el hook. No se usa `--no-verify` como habito: un hook
que se salta sistematicamente es peor que no tener hook, porque da una falsa
sensacion de red de seguridad.

## Mensajes de commit

Se sigue [Conventional Commits](https://www.conventionalcommits.org/). El hook
`commit-msg` lo verifica con commitlint y rechaza lo que no cumpla.

```
<tipo>(<ambito>): <descripcion>

<cuerpo: el porque del cambio>

<pie: BREAKING CHANGE y trailers de atribucion>
```

Reglas del asunto:

- En espanol, en imperativo, en minuscula, sin punto final.
- Maximo 72 caracteres.
- Describe **que cambia para quien lo usa o lo lee**, no que archivos se tocaron.
- Sin emojis.

### Tipos

| Tipo       | Cuando                                              |
| ---------- | --------------------------------------------------- |
| `feat`     | Funcionalidad nueva visible para el usuario         |
| `fix`      | Correccion de un defecto                            |
| `refactor` | Cambio interno sin alterar el comportamiento        |
| `style`    | Solo formato: espacios, comas, saltos. Nunca logica |
| `perf`     | Mejora de rendimiento                               |
| `docs`     | Documentacion                                       |
| `test`     | Pruebas                                             |
| `build`    | Dependencias, empaquetado, configuracion de build   |
| `ci`       | Integracion continua                                |
| `chore`    | Mantenimiento sin efecto en `src/`                  |
| `revert`   | Revierte un commit anterior                         |

### Ambitos

La lista cerrada vive en `commitlint.config.js`, que es la fuente de verdad. Los
ambitos coinciden con el vocabulario canonico de CLAUDE.md, no con nombres de
carpeta improvisados. Cuando aparece un modulo nuevo, se anade alli primero.

### Ejemplos

```
feat(theme): anadir tema oscuro conmutable desde ajustes
feat(i18n): anadir espanol e ingles conmutables en caliente
feat(export): exportar una rutina a PDF con las series en blanco
fix(exercises): conservar el equipamiento al crear un ejercicio
fix(a11y): sumar el area segura a la altura de la barra inferior
refactor(storage): mover el acceso a localStorage a la capa de dominio
style: aplicar prettier a todo el codigo base
build(deps): anadir prettier, stylelint y los hooks de git
docs: documentar el vocabulario canonico y las reglas duras
```

Un asunto malo describe el archivo; uno bueno describe el efecto:

| Mal                    | Bien                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `fix: arreglar bug`    | `fix(exercises): aceptar la coma decimal al anotar el peso`   |
| `feat: cambios varios` | `feat(routines): permitir renombrar y recolorear una rutina`  |
| `refactor: Modal.jsx`  | `refactor(shared): confinar el foco dentro del dialogo modal` |

### Cambios que rompen datos

Cualquier cambio en la forma de lo que hay guardado en localStorage lleva
`BREAKING CHANGE:` en el pie, con la migracion que lo acompana:

```
refactor(storage)!: renombrar workoutDay a routine

El vocabulario del codigo y el de la interfaz habian divergido: la carpeta decia
workout-days y la pantalla decia Rutinas. Con i18n a punto de entrar, ese mismo
concepto habria tenido dos claves de traduccion posibles.

BREAKING CHANGE: la clave lomito-train-workout-days pasa a lomito-train-routines.
La migracion v2-to-v3 la renombra y verifica la lectura antes de borrar la vieja.
```

## Atribucion

Lo que aporta trazabilidad real, y nada mas:

**Identidad de git coherente.** El nombre y el correo de los commits deben
identificar a una persona de forma estable:

```bash
git config --local user.name "Nombre Apellido"
git config --local user.email "correo@ejemplo.com"
```

**Trailers de atribucion.** Se anaden al pie del mensaje, separados por una linea
en blanco:

- `Co-Authored-By: Nombre <correo>` cuando el cambio se escribio entre varios, o
  con asistencia de una herramienta de IA. GitHub lo reconoce y atribuye el commit
  a ambos.
- `Reviewed-by: Nombre <correo>` cuando alguien lo reviso antes de integrarlo.

**Plantilla de mensaje.** Ya configurada en este repositorio:

```bash
git config --local commit.template .gitmessage
```

Al escribir `git commit` sin `-m`, el editor abre con los tipos y ambitos
recordados en comentarios.

Lo que **no** se usa, y por que: no hay `AUTHORS` ni `CODEOWNERS` (un solo autor:
serian ficcion administrativa), ni etiquetas `@author` en las cabeceras de los
modulos (envejecen mal en cuanto alguien toca el archivo, y `git log` ya lo sabe
con mas precision).

## Formateo masivo y git blame

El commit que aplico Prettier a todo el codigo no debe contaminar `git blame`.
Su SHA esta en `.git-blame-ignore-revs`. Para que git lo respete:

```bash
git config --local blame.ignoreRevsFile .git-blame-ignore-revs
```

Todo commit de formateo posterior se anade a ese archivo, y nunca mezcla formato
con logica: son dos commits distintos, siempre.

## Ramas

`main` es la rama de integracion y siempre debe construir. El trabajo con riesgo va
en una rama corta con el mismo vocabulario que los ambitos de commit:

```
refactor/storage-domain-layer
feat/theme-dark
fix/a11y-safe-area
```
