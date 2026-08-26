#!/usr/bin/env node
/**
 * Comprueba la nomenclatura BEMIT cruzando el JSX contra el SCSS.
 *
 * Existe porque la regla 12 de CLAUDE.md se incumplio dos veces durante la fase 4:
 * un renombrado masivo dejo diez modificadores sin prefijo, y todos quedaron sin
 * estilos sin que fallara ni el lint ni el build. Lo que se incumple dos veces se
 * automatiza o se retira del documento.
 *
 * Falla si encuentra:
 *  - una clase en el JSX sin prefijo BEMIT
 *  - una clase de componente usada en el JSX que ningun SCSS define
 *  - un bloque cuyo nombre no coincide con el de su componente
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';

const RAIZ = 'src';
const PREFIJOS = ['c-', 'o-', 'u-', 'is-', 'has-', 'js-'];

function recorrer(dir, ext, salida = []) {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) recorrer(ruta, ext, salida);
    else if (ruta.endsWith(ext)) salida.push(ruta);
  }
  return salida;
}

/** Convierte ExerciseCard en exercise-card. */
const aKebab = (nombre) =>
  nombre
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

const errores = [];

// ── Clases usadas en el JSX ─────────────────────────────────────────────────
const usadas = new Map();
for (const archivo of recorrer(RAIZ, '.jsx')) {
  const texto = readFileSync(archivo, 'utf8');
  for (const m of texto.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g)) {
    const contenido = m[1] ?? m[2] ?? m[3] ?? '';
    for (const tok of contenido.matchAll(
      /\b[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?\b/g,
    )) {
      const clase = tok[0];
      if (PREFIJOS.some((p) => clase.startsWith(p))) {
        usadas.set(clase, archivo);
      } else if (clase.includes('__') || clase.includes('-')) {
        errores.push(`${relative(RAIZ, archivo)}: la clase "${clase}" no lleva prefijo BEMIT`);
      }
    }
  }
  // Clases construidas por interpolacion: `c-x--${variante}`
  for (const m of texto.matchAll(/`((?:c|o|u)-[a-z0-9-]+(?:__[a-z0-9-]+)?)--\$\{/g)) {
    usadas.set(`${m[1]}--*`, archivo);
  }
}

// ── Selectores definidos en el SCSS ─────────────────────────────────────────
// Se resuelve el & de Sass con una pila: '&--header' dentro de '&__sets-row' da
// '<bloque>__sets-row--header', no '<bloque>--header'.
const definidas = new Set();
for (const archivo of recorrer(RAIZ, '.scss')) {
  const texto = readFileSync(archivo, 'utf8');
  const pila = [];
  for (const cruda of texto.split('\n')) {
    const linea = cruda.replace(/\/\/.*$/, '').trim();
    if (linea === '') continue;

    if (linea.endsWith('{')) {
      const selector = linea.slice(0, -1).trim();
      const padre = pila.length > 0 ? pila[pila.length - 1] : null;
      let resuelto = null;

      // Un selector puede llevar varias alternativas separadas por comas.
      for (const parte of selector.split(',').map((x) => x.trim())) {
        const conAmp = parte.match(/^&((?:__|--)[a-z0-9-]+)+/);
        const claseSuelta = parte.match(/^\.((?:c|o|u|is|has)-[a-z0-9-]+)/);
        if (conAmp && padre) {
          const nombre = padre + conAmp[0].slice(1);
          definidas.add(nombre);
          resuelto = resuelto ?? nombre;
        } else if (claseSuelta) {
          definidas.add(claseSuelta[1]);
          resuelto = resuelto ?? claseSuelta[1];
        }
      }
      // Un at-rule o un selector sin clase no cambia el contexto BEM.
      pila.push(resuelto ?? padre);
    } else if (linea.startsWith('}')) {
      pila.pop();
    }

    // Clases compuestas dentro de la linea: &.is-active, .c-x .c-y
    for (const m of linea.matchAll(/\.((?:c|o|u|is|has)-[a-z0-9-]+)/g)) definidas.add(m[1]);
  }

  // El nombre del bloque debe coincidir con el del componente
  const esperado = `c-${aKebab(basename(archivo, '.scss'))}`;
  const primero = texto.match(/^\s*\.(c-[a-z0-9-]+)/m)?.[1];
  const esComponente = !archivo.includes('/styles/');
  if (esComponente && primero && primero !== esperado && basename(dirname(archivo)) !== 'styles') {
    errores.push(
      `${relative(RAIZ, archivo)}: el bloque es "${primero}" y el componente se llama "${esperado}"`,
    );
  }
}

// ── Clases usadas y no definidas ────────────────────────────────────────────
const ESTADOS_VALIDOS = ['is-selected', 'is-active', 'is-open', 'is-loading'];

for (const [clase, archivo] of usadas) {
  if (clase.endsWith('--*')) continue;

  // Los ganchos de JS no llevan estilos por definicion.
  if (clase.startsWith('js-')) continue;

  // Las clases de estado no se eximen de la comprobacion: eximirlas dejo pasar un
  // is-active en el JSX contra un --active en el SCSS, y la pestana activa quedo
  // sin estilo sin que fallara nada.
  if (clase.startsWith('is-') || clase.startsWith('has-')) {
    if (clase.startsWith('is-') && !ESTADOS_VALIDOS.includes(clase)) {
      errores.push(
        `${relative(RAIZ, archivo)}: "${clase}" no esta en el vocabulario cerrado de estados (${ESTADOS_VALIDOS.join(', ')})`,
      );
    } else if (!definidas.has(clase)) {
      errores.push(
        `${relative(RAIZ, archivo)}: el estado "${clase}" no tiene ninguna regla en SCSS`,
      );
    }
    continue;
  }

  if (!definidas.has(clase)) {
    errores.push(`${relative(RAIZ, archivo)}: la clase "${clase}" no tiene ninguna regla en SCSS`);
  }
}

if (errores.length > 0) {
  console.error(`\nBEMIT: ${errores.length} problema(s)\n`);
  for (const e of errores) console.error(`  ${e}`);
  console.error('');
  process.exit(1);
}
console.log(`BEMIT correcto: ${usadas.size} clases usadas, ${definidas.size} definidas.`);
