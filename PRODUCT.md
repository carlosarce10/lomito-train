# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Usuario primario: una persona que entrena en un gimnasio con pesas y quiere registrar
que hizo, con cuanto peso y cuantas repeticiones, sin friccion, entre serie y serie.

Situacion de uso confirmada: de pie, en el gimnasio, con el movil en una mano, con prisa
y a veces con las manos sudadas. Es el escenario que manda sobre cualquier decision de
interfaz: areas tactiles grandes, pocos pasos, nada que exija precision.

Audiencia secundaria confirmada: gente cercana al usuario primario (amigos, personas a
las que entrena). No son desconocidos, pero tampoco conocen el modelo mental de la app.
Consecuencia: la interfaz tiene que explicarse sola sin manual, y el ingles tiene que ser
una traduccion real y completa, no un adorno.

No es un producto publico abierto. No hay cuentas, ni registro, ni soporte.

## Product Purpose

Llevar el registro de entrenamiento de fuerza: catalogo de ejercicios propios, rutinas
que agrupan ejercicios, y el peso y las repeticiones de cada serie.

Exito: el usuario abre la app en el gimnasio, encuentra su rutina del dia en menos de dos
toques, anota una serie sin salir de la pantalla, y al mes siguiente puede ver si esta
levantando mas que antes.

## Positioning

Los registradores de entrenamiento del mercado piden cuenta, conexion y suscripcion, y
vienen con un catalogo de ejercicios cerrado que casi nunca coincide con el gimnasio real
del usuario. Lomito Train hace lo contrario: el catalogo lo escribe el usuario, los datos
viven en su dispositivo, y funciona sin conexion y sin cuenta.

Contrapartida asumida: sin servidor no hay sincronizacion entre dispositivos ni copia de
seguridad automatica. Por eso la exportacion de datos no es una funcion accesoria, es la
unica via de respaldo y portabilidad que tiene el usuario.

## Operating Context

- Se instala en el movil desde el navegador como PWA: icono propio, pantalla completa y
  funcionamiento sin conexion. Se despliega en un hosting estatico.
- Uso principal en movil, en vertical, con una sola mano.
- El gimnasio suele tener mala cobertura. La app no puede depender de la red en ningun
  momento del flujo principal.
- La rutina se consulta tambien fuera de la pantalla: el usuario quiere poder llevarsela
  impresa o en PDF.
- Idiomas de uso: espanol e ingles, conmutables por el usuario.

## Capabilities and Constraints

Funcionalidad confirmada hoy:

- Ejercicios: crear, editar, borrar, buscar y filtrar por grupo muscular. Cada ejercicio
  tiene nombre, uno o varios grupos musculares, equipamiento opcional y una lista de series
  con peso y repeticiones.
- Rutinas: crear, editar, borrar, asignarles un color y componerlas con ejercicios del
  catalogo.

Funcionalidad decidida para esta fase:

- Cambio de idioma espanol/ingles.
- Tema claro y oscuro, ademas de seguir el tema del sistema.
- Validacion de todo lo que escribe el usuario.
- Exportar una rutina a PDF.
- Exportar los datos a Excel.

Decisiones de producto tomadas:

- El modulo de sesiones de entrenamiento (sesion activa, cronometro, historial) se elimina.
  Existia en el codigo pero nunca estuvo conectado a la aplicacion. La app queda como
  catalogo de ejercicios y rutinas con sus marcas de peso y repeticiones.
- En consecuencia, la exportacion a Excel cubre ejercicios, rutinas y series. No hay
  historial de sesiones que exportar.

Restricciones tecnicas:

- Persistencia unica: localStorage del navegador. Sin backend, sin base de datos, sin red.
  El usuario puede perder todo si borra los datos del navegador, y la app debe tratar ese
  riesgo como real.
- Los datos guardados deben poder migrarse entre versiones del esquema sin perder nada.
- El proyecto no usa TypeScript. La seguridad de tipos tiene que venir de validacion en
  tiempo de ejecucion.

Terminologia del dominio pendiente de fijar: el codigo usa "workout day" donde la interfaz
dice "rutina", y "muscleGroup" y "categories" para el mismo concepto. El vocabulario
canonico se fija en CLAUDE.md y manda sobre codigo, carpetas, interfaz y traducciones.

## Brand Commitments

- Nombre: Lomito Train. Confirmado y no se toca.
- El tema claro conserva la identidad azul actual. Es una restriccion explicita del usuario.
- Sin emojis ni iconos decorativos en documentacion, comentarios ni mensajes de commit.

## Evidence on Hand

- Codigo fuente en src/, aproximadamente 4.400 lineas entre JSX, JS y SCSS.
- Repositorio: https://github.com/carlosarce10/lomito-train (publico, sin commits todavia).
- No hay logotipo, ni iconos de aplicacion, ni capturas, ni textos de marketing, ni datos
  de usuarios reales. Nada de eso debe inventarse ni darse por existente.

## Product Principles

1. El gimnasio manda. Si una decision de interfaz funciona en el escritorio pero no de pie
   con una mano, esta mal.
2. Los datos son del usuario y solo viven en su dispositivo. Exportar no es una funcion
   secundaria: es la garantia de que no los pierde.
3. Se explica sola. Alguien cercano al usuario tiene que poder abrirla y entenderla sin
   que nadie se la explique.
4. Un solo vocabulario. El mismo concepto se llama igual en el codigo, en las carpetas, en
   la interfaz y en las dos traducciones.
5. Nada a medias. Una funcion que existe en el codigo pero no esta conectada es deuda, no
   una funcion.

## Accessibility & Inclusion

- Objetivo WCAG 2.1 AA para contraste de texto en ambos temas.
- Areas tactiles de 44 por 44 pixeles como minimo, por el escenario de uso real.
- Toda accion que hoy solo se puede hacer deslizando el dedo necesita una alternativa
  accesible por teclado y por lector de pantalla.
- Espanol e ingles como idiomas de primera clase, con el atributo lang del documento
  sincronizado con el idioma activo.
