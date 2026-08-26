import { isoDay, saveBlob, slugifyFilename } from '../file/downloadFile';
import { sanitizeCell } from '../file/sanitize';

/**
 * Exportacion de una rutina a PDF, para llevarla al gimnasio en papel o en el movil.
 *
 * jsPDF y autotable se cargan con import() diferido: pesan unos 130 kB gzip y no
 * tienen por que estar en el arranque de una aplicacion que se abre con mala
 * cobertura. Ver docs/export.md.
 */

const MARGEN = 14;

/** Carga el motor de PDF. Se puede llamar antes del clic para precalentar la cache. */
export async function loadPdfEngine() {
  const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  return { JsPDF, autoTable };
}

/**
 * Genera el PDF de una rutina y lo entrega al usuario.
 *
 * El documento respeta el idioma activo pero nunca el tema: el papel es blanco
 * siempre, y por eso las etiquetas llegan ya traducidas en `labels` en lugar de
 * resolverse aqui. Este modulo no conoce i18n ni React.
 *
 * @param {object} params
 * @param {{ name: string }} params.routine Rutina a exportar.
 * @param {Array<{ name: string, muscleGroups: string[], equipment: string, sets: Array }>}
 *   params.exercises Ejercicios ya resueltos y traducidos.
 * @param {object} params.labels Textos ya traducidos que necesita el documento.
 * @param {number} [params.blankRows] Filas en blanco por ejercicio, para anotar a mano.
 * @returns {Promise<{ ok: boolean, error?: Error }>}
 */
export async function exportRoutinePdf({ routine, exercises, labels, blankRows = 4 }) {
  try {
    const { JsPDF, autoTable } = await loadPdfEngine();
    const doc = new JsPDF({ unit: 'mm', format: 'a4' });

    const anchoPagina = doc.internal.pageSize.getWidth();

    // Cabecera
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(sanitizeCell(routine.name), MARGEN, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(`${labels.appName} · ${labels.date}`, MARGEN, 29);
    doc.setTextColor(0);

    let cursorY = 38;

    for (const ejercicio of exercises) {
      // Las series guardadas son la referencia; las filas en blanco son para anotar
      // lo de hoy, que es el motivo de llevarse la rutina impresa.
      const filas = [
        ...ejercicio.sets.map((serie, i) => [
          String(i + 1),
          serie.weight ? String(serie.weight) : '',
          serie.reps ? String(serie.reps) : '',
          '',
          '',
        ]),
        ...Array.from({ length: blankRows }, (_, i) => [
          String(ejercicio.sets.length + i + 1),
          '',
          '',
          '',
          '',
        ]),
      ];

      const subtitulo = [ejercicio.muscleGroups.join(' · '), ejercicio.equipment]
        .filter(Boolean)
        .join('  |  ');

      autoTable(doc, {
        startY: cursorY,
        head: [
          [{ content: sanitizeCell(ejercicio.name), colSpan: 5, styles: { halign: 'left' } }],
          ['#', labels.targetWeight, labels.targetReps, labels.actualWeight, labels.actualReps],
        ],
        body: filas,
        theme: 'grid',
        margin: { left: MARGEN, right: MARGEN },
        styles: { fontSize: 9, cellPadding: 2.2, lineColor: 210, textColor: 40 },
        headStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 26, halign: 'center' },
          2: { cellWidth: 26, halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
        },
        // Que una tabla no se parta a mitad y que la cabecera se repita es justo lo
        // que hace falta con rutinas largas, y es lo que autotable resuelve solo.
        rowPageBreak: 'avoid',
        showHead: 'everyPage',
        didDrawPage: () => {
          const pagina = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(140);
          doc.text(String(pagina), anchoPagina - MARGEN, doc.internal.pageSize.getHeight() - 8, {
            align: 'right',
          });
          doc.setTextColor(0);
        },
        willDrawCell: (data) => {
          if (data.section === 'head' && data.row.index === 0) {
            doc.setFillColor(226, 232, 240);
          }
        },
      });

      cursorY = doc.lastAutoTable.finalY + 4;

      if (subtitulo) {
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(sanitizeCell(subtitulo), MARGEN, cursorY);
        doc.setTextColor(0);
        cursorY += 8;
      }
    }

    const nombre = `lomito-train_${slugifyFilename(routine.name, 'rutina')}_${isoDay()}.pdf`;
    return await saveBlob(doc.output('blob'), nombre, { title: routine.name });
  } catch (error) {
    return { ok: false, error };
  }
}
