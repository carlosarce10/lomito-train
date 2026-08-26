/**
 * Reglas del mensaje de commit. El tipo y el ambito son vocabulario cerrado en
 * ingles; la descripcion se escribe en espanol. Detalle en CONTRIBUTING.md.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'style',
        'perf',
        'docs',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        // Features de src/features
        'exercises',
        'routines',
        'settings',
        // Capas transversales
        'app',
        'domain',
        'storage',
        'catalog',
        'validation',
        'shared',
        'styles',
        'theme',
        'i18n',
        'export',
        'a11y',
        // Repositorio
        'config',
        'deps',
        'docs',
        'release',
      ],
    ],
    'scope-empty': [1, 'never'],
    // lower-case y no kebab-case: kebab-case rechaza los digitos, y a11y es un
    // ambito legitimo. La lista cerrada de scope-enum ya impide inventarse ambitos.
    'scope-case': [2, 'always', 'lower-case'],
    // Prohibe capitalizar la primera letra, pero deja pasar los identificadores
    // camelCase y PascalCase del codigo (setState, useExercises, ExercisesPage),
    // que son parte legitima de la descripcion de un cambio.
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-full-stop': [2, 'never', '.'],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
};
