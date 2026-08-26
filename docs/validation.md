# Validacion de entrada

Vigente desde la fase 7. Ver [plan.md](plan.md).

## Contrato

1. Toda entrada del usuario se valida en `@domain/validation` **antes** de tocar el
   almacenamiento, venga de un formulario, de una importacion o de una migracion.
2. La interfaz solo muestra el resultado. No decide reglas.
3. Los limites viven en `limits.js` y no se repiten en el JSX.

## Estado actual

No hay capa de validacion. Existen dos `name.trim()` en los formularios y dos
guardas `isNaN(x) || x < 0` ad hoc en los inputs numericos. `maxLength` esta en el
JSX, que es presentacion, y no en la capa de datos: una importacion o una edicion
manual del localStorage se lo salta entero.

## El defecto mas grave

Los inputs de peso y repeticiones **corrompen el dato a 0 sin ningun aviso**.

Escenario reproducible en un teclado espanol:

1. El usuario escribe `22,5` en el campo Peso.
2. Un `<input type="number">` con coma devuelve `value = ''`.
3. El codigo hace `const num = value === '' ? 0 : parseFloat(value)` y persiste
   `weight: 0`.
4. **El input sigue mostrando `22,5` en pantalla.**
5. El usuario cree que guardo 22,5 kg. En localStorage hay un 0.
6. La marca del ejercicio pasa a "Sin record aun".

Ocurre en el nucleo del producto. Tambien se dispara con un punto final (`22.`) o un
signo suelto, y el mismo patron `value={x || ''}` impide escribir un 0 legitimo.

**Correccion.** El input conserva la **cadena cruda** mientras se escribe y solo se
convierte al confirmar. `parseDecimal` acepta coma y punto segun el locale activo.
Un valor no valido se comunica; nunca se sustituye en silencio por 0.

## Limites

| Campo                       | Regla                                                   |
| --------------------------- | ------------------------------------------------------- |
| `name` (ejercicio y rutina) | 1 a 60 caracteres tras normalizar. No vacio             |
| `muscleGroupIds`            | Al menos uno. Todos deben existir en el catalogo        |
| `equipmentId`               | Opcional. Si viene, debe existir en el catalogo         |
| `weight`                    | 0 a 1000, multiplo de 0,25                              |
| `reps`                      | Entero, 0 a 500                                         |
| `sets`                      | Maximo por ejercicio, para acotar el tamano del almacen |
| `colorId`                   | Debe existir en el catalogo                             |

Hoy no hay techo: se puede guardar 999999 kg, repeticiones decimales, y negativos
por el teclado numerico del movil.

## Normalizacion

Se aplica a todo texto que escribe el usuario, antes de validar:

- Recorte de extremos y colapso de espacios internos.
- Eliminacion de caracteres de control (U+0000-U+0008, U+000B, U+000C, U+000E-U+001F).
- Eliminacion de marcas bidireccionales y de anchura cero (U+200B, U+200E, U+200F,
  U+202A-U+202E, U+FEFF), que producen nombres invisibles.

Esta normalizacion es tambien la primera capa de defensa contra la inyeccion de
formulas del exportador a Excel. Ver [export.md](export.md).

## Validacion al leer

Hoy no existe: `readRaw` hace `JSON.parse` y devuelve lo que salga. Si el JSON esta
corrupto o alguien lo edita a mano, la aplicacion renderiza basura o revienta. Un
ejercicio sin `sets` lanza un `TypeError` en render y, sin `ErrorBoundary`, React
desmonta el arbol completo: pantalla en blanco, sin forma de recuperar ni de
exportar nada.

El repositorio de la fase 2 valida contra el esquema **al leer y al escribir**. Lo
que no valida no entra, y se reporta en lugar de romper la pantalla.

## Por que validadores propios y no una libreria

Zod pesa unos 14 kB gzip, que sobre los 71,8 kB del bundle actual es un 19%. Las
reglas que necesita este proyecto son siete (`required`, `minLength`, `maxLength`,
`range`, `integer`, `oneOf`, `unique`) y caben en unas 120 lineas sin dependencias.
La decision se reabre si aparece un caso que las reglas propias no cubran.
