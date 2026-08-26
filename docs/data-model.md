# Modelo de datos y almacenamiento

Entra en las fases 2 y 3. Ver [plan.md](plan.md).

## Claves

Todas declaradas en `src/domain/storage/keys.js` y en ningun otro sitio.

| Clave                         | Contenido              | Estado                          |
| ----------------------------- | ---------------------- | ------------------------------- |
| `lomito-train-meta`           | `{ schemaVersion: 3 }` | Se conserva                     |
| `lomito-train-exercises`      | `Exercise[]`           | Se conserva, cambia de forma    |
| `lomito-train-routines`       | `Routine[]`            | Nueva. Renombra `-workout-days` |
| `lomito-train-settings`       | `{ language, theme }`  | Nueva                           |
| `lomito-train-workout-days`   | —                      | Se borra tras migrar            |
| `lomito-train-sessions`       | —                      | Se borra. Modulo eliminado      |
| `lomito-train-active-session` | —                      | Se borra. Modulo eliminado      |

## Esquemas v3

```
Exercise  { id: uuid,
            name: string (1..60, normalizado),
            muscleGroupIds: string[] (>=1, ids del catalogo, sin duplicados),
            equipmentId: string | null,
            sets: Set[],
            createdAt: ISO, updatedAt: ISO }

Set       { id: uuid,
            weight: number (0..1000, multiplo de 0.25),
            reps: number (entero 0..500) }

Routine   { id: uuid,
            name: string (1..60, normalizado),
            colorId: string (id del catalogo, NO hex),
            exerciseIds: uuid[] (sin duplicados, sin huerfanos, orden significativo),
            createdAt: ISO, updatedAt: ISO }

Settings  { language: 'es' | 'en' | null,
            theme: 'light' | 'dark' | 'system' }

Backup    { app: 'lomito-train', schemaVersion: 3, exportedAt: ISO,
            data: { exercises: Exercise[], routines: Routine[] } }
```

## Invariantes

Ninguna escritura puede romperlos, venga de un formulario, de una importacion o de
una migracion.

1. `name` normalizado y no vacio, maximo 60 caracteres.
2. Un ejercicio tiene al menos un grupo muscular.
3. `exerciseIds` sin duplicados y sin ids que no resuelvan.
4. `weight` y `reps` dentro de rango; `reps` siempre entero.
5. `equipmentId` y `colorId` siempre existen en su catalogo.

## Migracion v2 a v3

| Cambio                       | Detalle                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `muscleGroup` + `categories` | Se funden en `muscleGroupIds`, filtrado contra el catalogo                     |
| `equipment`                  | Pasa a `equipmentId`                                                           |
| `color` hexadecimal          | Pasa a `colorId`. Un hex desconocido cae al color por defecto                  |
| Rutinas                      | Se les anade `updatedAt`, que hoy no tienen                                    |
| `exerciseIds`                | Se deduplica y se le quitan los huerfanos                                      |
| Claves de sesiones           | Se borran                                                                      |
| `-workout-days`              | Se renombra a `-routines`, **verificando la lectura antes de borrar la vieja** |

## Reglas del runner de migraciones

Estas cuatro reglas existen porque el runner actual las incumple todas:

1. **Es un registro ordenado, no una escalera de `if`.** `CURRENT_VERSION` se deriva
   del propio registro (`MIGRATIONS.at(-1).version`) para que no puedan
   desincronizarse.
2. **Sella la version dentro del bucle**, tras cada paso, no al final y fuera de todo
   condicional. Hoy se sella siempre, aunque no se haya ejecutado ninguna migracion:
   el dia que alguien suba la version y olvide el bloque correspondiente, todos los
   usuarios quedan marcados sin haber migrado, y no volvera a intentarse nunca.
3. **No sella si alguna escritura fallo.** `driver.js` devuelve `{ok, error}`. Hoy
   `writeRaw` traga la excepcion en un `catch {}` vacio y la migracion se da por
   buena aunque no se haya escrito nada.
4. **No degrada.** Si la version guardada es superior a `CURRENT_VERSION` (el usuario
   abrio un build mas nuevo antes), aborta sin escribir en lugar de rebajarla.

Si una migracion falla, el error llega a `bootstrap.js`, que renderiza una pantalla
de recuperacion **con la opcion de exportar el respaldo crudo antes de tocar nada**.

## Por que hace falta una capa de repositorio

`useLocalStorage` es hoy tres cosas a la vez: el repositorio, la cache en memoria y
el estado de React. Se instancia por componente, asi que cada consumidor mantiene su
propia copia del array y lo reescribe entero en cada cambio.

Consecuencia medible: dos pestanas abiertas se pisan el array completo, y no hay
escucha del evento `storage` en ninguna parte del codigo.

Consecuencia de diseno: los objetivos que no pasan por un formulario (validacion,
PDF, Excel, respaldo) no tienen desde donde leer. Un exportador tendria que montar
un hook de React con estado de busqueda para poder listar ejercicios.
