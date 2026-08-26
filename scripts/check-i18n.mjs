#!/usr/bin/env node
/**
 * Comprueba los catalogos de traduccion.
 *
 * Una traduccion que falta no rompe el build por si sola: la interfaz muestra la
 * clave cruda y nadie se entera hasta que un usuario la ve. De ahi este script.
 *
 * Falla si encuentra:
 *  - una clave presente en un idioma y ausente en otro
 *  - una clave con plural incompleto para las categorias del idioma
 *  - una clave usada en el codigo que ningun catalogo declara
 *  - una clave declarada que nadie usa
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RAIZ = 'src';
const LOCALES = join(RAIZ, 'i18n', 'locales');
const IDIOMAS = readdirSync(LOCALES);

/** Aplana { a: { b: 'x' } } en { 'a.b': 'x' }. */
function aplanar(objeto, prefijo = '', salida = {}) {
  for (const [clave, valor] of Object.entries(objeto)) {
    const ruta = prefijo ? `${prefijo}.${clave}` : clave;
    if (valor !== null && typeof valor === 'object') aplanar(valor, ruta, salida);
    else salida[ruta] = valor;
  }
  return salida;
}

function recorrer(dir, ext, salida = []) {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) recorrer(ruta, ext, salida);
    else if (ruta.endsWith(ext)) salida.push(ruta);
  }
  return salida;
}

const errores = [];
const catalogos = {};

for (const idioma of IDIOMAS) {
  catalogos[idioma] = {};
  for (const archivo of readdirSync(join(LOCALES, idioma))) {
    const namespace = archivo.replace('.json', '');
    const contenido = JSON.parse(readFileSync(join(LOCALES, idioma, archivo), 'utf8'));
    for (const [clave, valor] of Object.entries(aplanar(contenido))) {
      catalogos[idioma][`${namespace}.${clave}`] = valor;
    }
  }
}

// ── Paridad entre idiomas ───────────────────────────────────────────────────
// Las formas plurales quedan fuera: cada idioma tiene sus propias categorias, y
// exigir las mismas obligaria al ingles a declarar un "_many" que no usa nunca.
// La completitud de los plurales se comprueba mas abajo, idioma por idioma.
const ES_PLURAL = /_(zero|one|two|few|many|other)$/;
const todas = new Set(
  Object.values(catalogos)
    .flatMap((c) => Object.keys(c))
    .filter((k) => !ES_PLURAL.test(k)),
);
for (const clave of [...todas].sort()) {
  const faltan = IDIOMAS.filter((i) => !(clave in catalogos[i]));
  if (faltan.length > 0) errores.push(`"${clave}" falta en: ${faltan.join(', ')}`);
}

// ── Plurales completos ──────────────────────────────────────────────────────
// Se comprueban contra las categorias que el idioma declara de verdad, no contra
// una lista fija: en cuanto entre un idioma con "few" o "many", esto lo exige solo.
for (const idioma of IDIOMAS) {
  const categorias = new Intl.PluralRules(idioma).resolvedOptions().pluralCategories;
  const bases = new Set(
    Object.keys(catalogos[idioma])
      .filter((k) => /_(zero|one|two|few|many|other)$/.test(k))
      .map((k) => k.replace(/_(zero|one|two|few|many|other)$/, '')),
  );
  for (const base of bases) {
    for (const categoria of categorias) {
      if (!(`${base}_${categoria}` in catalogos[idioma])) {
        errores.push(`"${base}" no tiene la forma "_${categoria}" que ${idioma} necesita`);
      }
    }
  }
}

// ── Claves usadas en el codigo ──────────────────────────────────────────────
const usadas = new Set();
for (const archivo of [...recorrer(RAIZ, '.jsx'), ...recorrer(RAIZ, '.js')]) {
  if (archivo.includes(join('i18n', 'locales'))) continue;
  const texto = readFileSync(archivo, 'utf8');

  // useTranslation('ns') fija el namespace por defecto de t() en ese archivo.
  const ns = texto.match(/useTranslation\(\s*'([a-z]+)'\s*\)/)?.[1] ?? 'common';
  for (const m of texto.matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) usadas.add(`${ns}.${m[1]}`);
  for (const m of texto.matchAll(/\btn\(\s*'([a-z]+)'\s*,\s*'([a-zA-Z0-9_.]+)'/g)) {
    usadas.add(`${m[1]}.${m[2]}`);
  }
  // Claves construidas por interpolacion. Se registran como prefijo con comodin.
  // tn('catalog', `muscleGroups.${id}`) cubre catalog.muscleGroups.*
  for (const m of texto.matchAll(/\btn\(\s*'([a-z]+)'\s*,\s*`([a-zA-Z0-9_.]+)\.\$\{/g)) {
    usadas.add(`${m[1]}.${m[2]}.*`);
  }
  // t(`detail.${x}`) cubre <ns>.detail.*
  for (const m of texto.matchAll(/\bt\(\s*`([a-zA-Z0-9_.]+)\.\$\{/g)) usadas.add(`${ns}.${m[1]}.*`);
}

// Los mensajes de validacion no se referencian por su clave desde el JSX: el
// dominio devuelve un codigo y la interfaz lo traduce. Asi que la comprobacion util
// es la inversa, y va en las dos direcciones: cada codigo que el dominio puede
// emitir tiene que tener mensaje, y cada mensaje tiene que corresponder a un codigo.
const codigos = new Set();
for (const archivo of recorrer(join(RAIZ, 'domain'), '.js')) {
  const texto = readFileSync(archivo, 'utf8');
  for (const m of texto.matchAll(/(?:code|issue):\s*'([a-zA-Z]+)'/g)) codigos.add(m[1]);
}
for (const codigo of codigos) {
  if (!(`validation.${codigo}` in catalogos[IDIOMAS[0]])) {
    errores.push(`el dominio emite el codigo "${codigo}" y no hay mensaje validation.${codigo}`);
  }
  usadas.add(`validation.${codigo}`);
}
for (const clave of Object.keys(catalogos[IDIOMAS[0]])) {
  if (clave.startsWith('validation.') && !codigos.has(clave.slice('validation.'.length))) {
    errores.push(`"${clave}" no corresponde a ningun codigo que el dominio emita`);
  }
}

// Claves que existen para una fase posterior y todavia no las consume nadie.
// Se listan una a una a proposito: una lista explicita se revisa, un comodin no.
const PENDIENTES = new Set([
  'common.error.duplicateName',
  'common.error.writeFailed',
  'common.action.download',
  'exercises.detail.editAction',
  'exercises.detail.deleteAction',
]);
for (const clave of PENDIENTES) usadas.add(clave);

const prefijos = [...usadas].filter((k) => k.endsWith('.*')).map((k) => k.slice(0, -2));
const cubierta = (clave) =>
  usadas.has(clave) ||
  prefijos.some((p) => clave.startsWith(`${p}.`)) ||
  // Las formas plurales se usan a traves de su base.
  usadas.has(clave.replace(/_(zero|one|two|few|many|other)$/, ''));

const referencia = catalogos[IDIOMAS[0]];
for (const clave of usadas) {
  if (clave.endsWith('.*')) continue;
  const existe =
    clave in referencia || Object.keys(referencia).some((k) => k.startsWith(`${clave}_`));
  if (!existe) errores.push(`"${clave}" se usa en el codigo y no esta en ningun catalogo`);
}
for (const clave of Object.keys(referencia)) {
  if (!cubierta(clave)) errores.push(`"${clave}" esta declarada y no la usa nadie`);
}

if (errores.length > 0) {
  console.error(`\ni18n: ${errores.length} problema(s)\n`);
  for (const e of errores) console.error(`  ${e}`);
  console.error('');
  process.exit(1);
}
console.log(
  `i18n correcto: ${Object.keys(referencia).length} claves en ${IDIOMAS.length} idiomas.`,
);
