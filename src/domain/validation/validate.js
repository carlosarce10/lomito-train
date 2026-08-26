/**
 * Valida un valor contra un esquema.
 *
 * Un esquema es un objeto plano `{ campo: regla }`, o `{ __each: esquema }` para
 * una lista homogenea. El resultado nunca lanza: la capa que llama decide que
 * hacer con los problemas encontrados.
 *
 * @param {object} schema Esquema de validacion.
 * @param {unknown} value Valor a comprobar.
 * @returns {{ ok: boolean, issues: Array<{ path: string, code: string, params?: object }> }}
 */
export function validate(schema, value) {
  const issues = [];
  recorrer(schema, value, '', issues);
  return { ok: issues.length === 0, issues };
}

function recorrer(schema, value, path, issues) {
  if (typeof schema === 'function') {
    const problema = schema(value);
    if (problema) issues.push({ path, ...problema });
    return;
  }

  if (schema.__each) {
    if (!Array.isArray(value)) {
      issues.push({ path, code: 'notAList' });
      return;
    }
    value.forEach((item, i) => recorrer(schema.__each, item, `${path}[${i}]`, issues));
    return;
  }

  if (value === null || typeof value !== 'object') {
    issues.push({ path, code: 'notAnObject' });
    return;
  }

  for (const [campo, regla] of Object.entries(schema)) {
    recorrer(regla, value[campo], path ? `${path}.${campo}` : campo, issues);
  }
}

/**
 * Filtra una lista dejando solo los elementos que cumplen el esquema.
 *
 * Se usa al leer del almacenamiento: un dato corrupto se descarta y se informa,
 * en lugar de dejar que reviente el render. Ver docs/data-model.md.
 *
 * @param {object} schema Esquema de cada elemento.
 * @param {unknown} list Lista cruda leida del almacen.
 * @returns {{ valid: Array, rejected: Array<{ index: number, issues: Array }> }}
 */
export function partition(schema, list) {
  if (!Array.isArray(list)) return { valid: [], rejected: [] };

  const valid = [];
  const rejected = [];
  list.forEach((item, index) => {
    const { ok, issues } = validate(schema, item);
    if (ok) valid.push(item);
    else rejected.push({ index, issues });
  });
  return { valid, rejected };
}
