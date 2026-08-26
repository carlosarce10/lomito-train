import { useCallback, useState } from 'react';

import { buildBackup, importBackup } from '@domain/storage/backup';
import { CURRENT_VERSION } from '@domain/storage/migrations';
import { exercisesRepository, routinesRepository } from '@domain/storage/repositories';
import { isoDay, saveBlob } from '@services/file/downloadFile';
import useToast from '@shared/components/ToastProvider/useToast';
import useTranslation from '@i18n/useTranslation';

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
        if (resultado.ok) toast.success(t('export.done'));
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
   * Aplica una copia de seguridad desde un fichero elegido por el usuario.
   * Vuelve a cargar la pagina al terminar: los stores ya tienen su instantanea en
   * memoria y releerla a mano dejaria la interfaz mostrando datos viejos.
   */
  const importarCopia = useCallback(
    async (file) => {
      setTrabajando('import');
      try {
        const texto = await file.text();
        const resultado = importBackup(JSON.parse(texto));
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
      } catch {
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
    importarCopia,
  };
}
