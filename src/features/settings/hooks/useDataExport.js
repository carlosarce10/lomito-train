import { useCallback, useState } from 'react';

import { buildBackup, importBackup, importExercises } from '@domain/storage/backup';
import { CURRENT_VERSION } from '@domain/storage/migrations';
import { exercisesRepository, routinesRepository } from '@domain/storage/repositories';
import { isoDay, saveBlob } from '@services/file/downloadFile';
import useToast from '@shared/components/ToastProvider/useToast';
import { buildImportDictionary } from '@i18n/importDictionary';
import useTranslation from '@i18n/useTranslation';

/**
 * Decide el formato de un archivo de importacion.
 *
 * La extension manda cuando existe, pero no basta: un archivo renombrado o una
 * descarga temporal sin extension no deben caer en la rama equivocada. El respaldo
 * es la firma del contenido, que no miente: un xlsx es un zip y empieza por PK, y
 * un JSON empieza por una llave.
 *
 * @param {File} file Archivo elegido por el usuario.
 * @returns {Promise<'xlsx'|'csv'|'json'>}
 */
async function detectarFormato(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'xlsx') return 'xlsx';
  if (extension === 'csv') return 'csv';
  if (extension === 'json') return 'json';

  const cabecera = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (cabecera[0] === 0x50 && cabecera[1] === 0x4b) return 'xlsx';

  const inicio = (await file.slice(0, 256).text()).replace(/^\uFEFF/, '').trimStart();
  if (inicio.startsWith('{')) return 'json';
  return 'csv';
}

/**
 * Exportacion e importacion de datos.
 *
 * Los motores de PDF y de Excel se cargan con import() diferido desde los propios
 * servicios, asi que este hook no los arrastra al arranque.
 *
 * @returns {object} Operaciones y el estado de trabajo en curso.
 */
export default function useDataExport() {
  const { t, tn, language } = useTranslation('settings');
  const toast = useToast();
  const [trabajando, setTrabajando] = useState(null);

  /** Etiquetas de catalogo que los servicios necesitan ya traducidas. */
  const etiquetas = useCallback(
    () => ({
      sheets: {
        exercises: t('export.sheets.exercises'),
        routines: t('export.sheets.routines'),
        routineExercises: t('export.sheets.routineExercises'),
        sets: t('export.sheets.sets'),
        metadata: t('export.sheets.metadata'),
      },
      columns: Object.fromEntries(
        [
          'id',
          'name',
          'muscleGroups',
          'equipment',
          'setCount',
          'maxWeight',
          'createdAt',
          'updatedAt',
          'color',
          'exerciseCount',
          'routine',
          'position',
          'exercise',
          'weight',
          'reps',
          'key',
          'value',
        ].map((clave) => [clave, t(`export.columns.${clave}`)]),
      ),
    }),
    [t],
  );

  const ejecutar = useCallback(
    async (clave, operacion) => {
      setTrabajando(clave);
      try {
        const resultado = await operacion();
        // El aviso nombra el archivo entregado: los tres botones daban el mismo
        // "listo" y el usuario no sabia cual de las tres descargas habia acabado.
        if (resultado.ok) toast.success(t('export.done', { name: resultado.filename }));
        else toast.error(t('export.failed'));
        return resultado;
      } finally {
        setTrabajando(null);
      }
    },
    [toast, t],
  );

  const exportarExcel = useCallback(
    () =>
      ejecutar('excel', async () => {
        const { exportWorkbook } = await import('@services/excel/workbook');
        return exportWorkbook({
          exercises: exercisesRepository.getAll(),
          routines: routinesRepository.getAll(),
          labels: etiquetas(),
          muscleGroupLabel: (id) => tn('catalog', `muscleGroups.${id}`),
          equipmentLabel: (id) => tn('catalog', `equipment.${id}`),
          colorLabel: (id) => tn('catalog', `colors.${id}`),
          schemaVersion: CURRENT_VERSION,
        });
      }),
    [ejecutar, etiquetas, tn],
  );

  const exportarCsv = useCallback(
    () =>
      ejecutar('csv', async () => {
        const { exportCsv } = await import('@services/excel/csv');
        const columnas = etiquetas().columns;
        const filas = exercisesRepository
          .getAll()
          .flatMap((ex) =>
            ex.sets.map((serie, i) => [
              ex.name,
              i + 1,
              serie.weight,
              serie.reps,
              ex.muscleGroupIds.map((id) => tn('catalog', `muscleGroups.${id}`)).join(' / '),
            ]),
          );
        return exportCsv({
          headers: [
            columnas.exercise,
            columnas.position,
            columnas.weight,
            columnas.reps,
            columnas.muscleGroups,
          ],
          rows: filas,
          filename: 'series',
          language,
        });
      }),
    [ejecutar, etiquetas, tn, language],
  );

  const exportarCopia = useCallback(
    () =>
      ejecutar('backup', async () => {
        const copia = buildBackup(
          CURRENT_VERSION,
          exercisesRepository.getAll(),
          routinesRepository.getAll(),
        );
        const blob = new Blob([JSON.stringify(copia, null, 2)], { type: 'application/json' });
        return saveBlob(blob, `lomito-train_copia_${isoDay()}.json`);
      }),
    [ejecutar],
  );

  /**
   * Importa un archivo del usuario: la copia JSON, el libro de Excel o el CSV de
   * series, decidido por la extension. Los tres acaban en el mismo camino validado
   * del dominio; lo que cambia es como se reconstruyen los datos.
   *
   * Vuelve a cargar la pagina al terminar: los stores ya tienen su instantanea en
   * memoria y releerla a mano dejaria la interfaz mostrando datos viejos.
   */
  const importarArchivo = useCallback(
    async (file) => {
      setTrabajando('import');
      try {
        const formato = await detectarFormato(file);
        let resultado;

        if (formato === 'xlsx') {
          // El libro trae etiquetas traducidas y relaciones por nombre: el
          // importador las reconstruye y el resultado entra por el mismo camino
          // validado que la copia JSON.
          const { importWorkbook } = await import('@services/excel/importWorkbook');
          const leido = await importWorkbook(file, buildImportDictionary());
          resultado = leido.ok
            ? importBackup(buildBackup(CURRENT_VERSION, leido.exercises, leido.routines))
            : leido;
        } else if (formato === 'csv') {
          // El CSV solo transporta series: sustituye los ejercicios y conserva las
          // rutinas, podando las referencias que queden huerfanas.
          const { importCsv } = await import('@services/excel/importCsv');
          const leido = importCsv(await file.text(), buildImportDictionary());
          resultado = leido.ok ? importExercises(leido.exercises) : leido;
        } else {
          resultado = importBackup(JSON.parse(await file.text()));
        }

        if (!resultado.ok) {
          toast.error(t('export.importFailed'));
          return resultado;
        }
        if (resultado.descartados > 0) {
          toast.error(t('export.importDiscarded', { count: resultado.descartados }));
        }
        toast.success(
          t('export.imported', {
            exercises: resultado.exercises,
            routines: resultado.routines,
          }),
        );
        window.setTimeout(() => window.location.reload(), 900);
        return resultado;
      } catch (error) {
        // El aviso resume; el detalle va a la consola. Un catch que traga el error
        // sin registrarlo deja el fallo sin diagnostico posible, que es justo lo
        // que la regla 7 quiere evitar.
        console.error('No se pudo importar el archivo', error);
        toast.error(t('export.importFailed'));
        return { ok: false, reason: 'corrupt' };
      } finally {
        setTrabajando(null);
      }
    },
    [toast, t],
  );

  return {
    trabajando,
    exportarExcel,
    exportarCsv,
    exportarCopia,
    importarArchivo,
  };
}
