// lib/api/exportUtils.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface CasoPruebaExport {
  id: string;
  titulo: string;
  categoria: string;
  estado: "Aprobado" | "Fallido" | "Bloqueado" | "Pendiente";
  prioridad: "Alta" | "Media" | "Baja";
  fecha: string;
}

// 1. Exportar a CSV (Excel)
export function exportarCasosACSV(casos: CasoPruebaExport[], filename = "Reporte_QA_Test_Lab.csv") {
  const headers = ["ID", "Título", "Categoría", "Estado", "Prioridad", "Fecha de Ejecución"];
  
  const rows = casos.map((c) => [
    `"${c.id}"`,
    `"${c.titulo.replace(/"/g, '""')}"`,
    `"${c.categoria}"`,
    `"${c.estado}"`,
    `"${c.prioridad}"`,
    `"${c.fecha}"`,
  ]);

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 2. Generar PDF Ejecutivo Profesional
export function generarPDFProfesional(casos: CasoPruebaExport[]) {
  const doc = new jsPDF();

  // Título del informe
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Gris oscuro elegante
  doc.text("Informe Ejecutivo de Calidad - QA Test Lab", 14, 20);

  // Subtítulo con la fecha actual
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generado el: ${new Date().toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 28);

  // Mapear los datos de los casos de prueba para la tabla
  const tableData = casos.map((c) => [
    c.id,
    c.titulo,
    c.categoria,
    c.prioridad,
    c.estado,
    c.fecha,
  ]);

  // Dibujar la tabla limpia en el PDF
  autoTable(doc, {
    startY: 35,
    head: [["ID", "Título", "Categoría", "Prioridad", "Estado", "Fecha"]],
    body: tableData,
    headStyles: { fillColor: [14, 165, 233] }, // Azul acorde a tu interfaz (sky-500)
    styles: { fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Descargar el archivo PDF automáticamente
  doc.save(`Reporte_QA_${new Date().toISOString().split("T")[0]}.pdf`);
}