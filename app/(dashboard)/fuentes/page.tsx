"use client";

import { useState } from "react";

// Lista de fuentes y referencias de QA
const FUENTES_QA = [
  {
    id: 1,
    titulo: "ISTQB® Glossary & Syllabi",
    categoria: "Estándar QA",
    tipo: "Estándares & Guías",
    descripcion: "Glosario oficial de términos y estándares internacionales para certificación e ingeniería de software.",
    url: "https://www.istqb.org/",
  },
  {
    id: 2,
    titulo: "Playwright Docs",
    categoria: "Automatización",
    tipo: "Documentación",
    descripcion: "Documentación oficial para automatización de pruebas End-to-End (E2E) modernas en web y multi-browser.",
    url: "https://playwright.dev/",
  },
  {
    id: 3,
    titulo: "OWASP Top 10",
    categoria: "Seguridad",
    tipo: "Estándares & Guías",
    descripcion: "Referencia fundamental sobre los diez riesgos y vulnerabilidades de seguridad más críticos en aplicaciones web.",
    url: "https://owasp.org/www-project-top-ten/",
  },
  {
    id: 4,
    titulo: "Cypress Documentation",
    categoria: "Automatización",
    tipo: "Documentación",
    descripcion: "Guías paso a paso para pruebas de integración, componentes y E2E rápido en navegadores Chromium y Firefox.",
    url: "https://docs.cypress.io/",
  },
  {
    id: 5,
    titulo: "Postman API Testing Guide",
    categoria: "API Testing",
    tipo: "Documentación",
    descripcion: "Guía oficial para estructurar colecciones, automatizar aserciones HTTP y ejecutar tests de integración de API.",
    url: "https://learning.postman.com/",
  },
  {
    id: 6,
    titulo: "k6 Performance Testing",
    categoria: "Rendimiento",
    tipo: "Herramientas",
    descripcion: "Herramienta open-source orientada a pruebas de carga, estrés y rendimiento de microservicios y APIs.",
    url: "https://k6.io/docs/",
  },
  {
    id: 7,
    titulo: "ISO/IEC 25010 Quality Model",
    categoria: "Estándar QA",
    tipo: "Estándares & Guías",
    descripcion: "Estándar internacional sobre modelos de calidad del software: mantenibilidad, usabilidad, fiabilidad y eficiencia.",
    url: "https://www.sonarsource.com/resources/library/iso-iec-25010-explained/",
  },
  {
    id: 8,
    titulo: "W3C WCAG 2.2 Guidelines",
    categoria: "Accesibilidad",
    tipo: "Estándares & Guías",
    descripcion: "Pautas de accesibilidad para el contenido web (WCAG) para garantizar pruebas incluyentes en nivel A, AA y AAA.",
    url: "https://www.w3.org/WAI/standards-guidelines/wcag/",
  },
  {
    id: 9,
    titulo: "Selenium WebDriver Docs",
    categoria: "Automatización",
    tipo: "Documentación",
    descripcion: "Referencia clásica para automatización web multiplataforma en Python, Java, C# y JavaScript.",
    url: "https://www.selenium.dev/documentation/",
  },
];

// Estructura de columnas y filas de ejemplo para el Excel
const COLUMNAS_EXCEL = [
  "ID",
  "RESUMEN",
  "Módulo / Página",
  "VERSIÓN",
  "Funcionalidad",
  "Caso de Prueba",
  "Precondiciones",
  "Pasos a Seguir",
  "Datos de Entrada",
  "Resultado Esperado",
  "Resultado Obtenido",
  "Tipo de Incidencia",
  "Categoría",
  "Estado v.1",
  "Responsable",
  "Fecha",
  "Observaciones",
  "Verificación",
  "Observaciones Fecha Verificación",
  "Estado V.2",
  "Observaciones V.2",
  "FECHA ESTADO V.2 y OBSERVACIONES",
];

const FILAS_EJEMPLO_EXCEL = [
  {
    id: "TC-001",
    resumen: "Login con credenciales válidas",
    modulo: "Autenticación / Login",
    version: "1.0.0",
    funcionalidad: "Acceso de usuario registrado",
    casoPrueba: "Verificar acceso correcto con correo y password válidos",
    precondiciones: "Usuario registrado activamente en BD",
    pasos: "1. Ir a /login\n2. Ingresar usuario\n3. Ingresar contraseña\n4. Clic en 'Ingresar'",
    datosEntrada: "user@qa.com / Pass123!",
    resultadoEsperado: "Redirección inmediata al Dashboard principal con token JWT",
    resultadoObtenido: "Redirecciona correctamente en < 500ms",
    tipoIncidencia: "N/A",
    categoria: "Funcional",
    estadoV1: "PASSED",
    responsable: "Carlos QA",
    fecha: "2026-10-20",
    observaciones: "Prueba ejecutada en ambiente Staging Chrome",
    verificacion: "OK",
    obsFechaVerif: "2026-10-21 / Verificado en Edge",
    estadoV2: "CLOSED",
    obsV2: "Sin regresión detectada",
    fechaEstadoV2: "2026-10-22 - Validado en Build 1.0.2",
  },
];

// Estructura de la plantilla de casos explicada en la guía
const PLANTILLA_GUIA = [
  { campo: "ID del Caso de Prueba", desc: "Identificador único para su seguimiento y trazabilidad (ej. TC_PAY_001)." },
  { campo: "Título / Nombre", desc: "Breve descripción que resume qué se va a validar." },
  { campo: "Historia de Usuario / Requisito", desc: "ID del artefacto o historia de usuario a la que pertenece (mantiene trazabilidad)." },
  { campo: "Precondiciones", desc: "Estado previo del sistema o entorno necesario antes de ejecutar la prueba (ej. usuario autenticado, saldo disponible)." },
  { campo: "Pasos de Ejecución", desc: "Secuencia numerada de acciones detalladas que el tester debe realizar." },
  { campo: "Datos de Prueba (Test Data)", desc: "Valores específicos de entrada que se utilizarán durante la ejecución (ej. credenciales, números de tarjeta)." },
  { campo: "Resultado Esperado", desc: "Comportamiento correcto que el sistema debe mostrar según la especificación si la prueba es exitosa." },
  { campo: "Resultado Actual", desc: "Comportamiento real observado en el sistema durante la ejecución (se completa al probar)." },
  { campo: "Estado (Status)", desc: "Estado de la ejecución: Pass (Pasa), Fail (Falla), Blocked (Bloqueado) o Untested (No probado)." },
  { campo: "Poscondiciones", desc: "Estado en el que queda el sistema tras finalizar la prueba." },
];

export default function FuentesTutorialesQA() {
  const [tabActiva, setTabActiva] = useState<"guia" | "fuentes" | "informe" | "excel">("guia");
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");

  // Filtrado de fuentes
  const fuentesFiltradas = FUENTES_QA.filter((f) => {
    const coincideTexto =
      f.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = filtroCategoria === "Todas" || f.tipo === filtroCategoria;
    return coincideTexto && coincideCat;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Encabezado */}
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
          CENTRO DE CONOCIMIENTO
        </span>
        <h1 className="text-2xl font-bold text-white">Fuentes y Tutoriales QA</h1>
        <p className="text-xs text-slate-400">
          Librería de referencias, guías metodológicas paso a paso y plantillas estándar para la gestión de calidad.
        </p>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto">
        <button
          onClick={() => setTabActiva("guia")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
            tabActiva === "guia"
              ? "border-sky-400 text-sky-400 bg-sky-500/10"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <span>🚀 Guía Primer Día (STLC)</span>
        </button>

        <button
          onClick={() => setTabActiva("fuentes")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
            tabActiva === "fuentes"
              ? "border-sky-400 text-sky-400 bg-sky-500/10"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <span>📚 Enlaces y Fuentes ({FUENTES_QA.length})</span>
        </button>

        <button
          onClick={() => setTabActiva("informe")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
            tabActiva === "informe"
              ? "border-sky-400 text-sky-400 bg-sky-500/10"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <span>📝 Cómo hacer un Informe de QA</span>
        </button>

        <button
          onClick={() => setTabActiva("excel")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
            tabActiva === "excel"
              ? "border-sky-400 text-sky-400 bg-sky-500/10"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <span>📊 Estructurar un Excel de QA</span>
        </button>
      </div>

      {/* PESTAÑA 0: GUÍA PRIMER DÍA / STLC */}
      {tabActiva === "guia" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-500/[0.08] to-[#07111f]/90 p-6 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20">
              METODOLOGÍA STLC
            </span>
            <h2 className="text-lg font-bold text-white">Consejos para el Primer Día y para Siempre</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enfrentarte al testing de una aplicación por primera vez puede dar algo de vértigo, pero si sigues un proceso estructurado como el Ciclo de Vida de las Pruebas de Software (STLC), sabrás exactamente qué hacer en cada momento.
            </p>
          </div>

          {/* Pasos STLC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="rounded-2xl border border-white/10 bg-[#0b192b]/90 p-5 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-sky-400">1. Análisis de Requisitos y Alcance</span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><strong className="text-white">Comprender el producto:</strong> Analiza la documentación, historias de usuario o especificaciones para entender qué debe hacer el sistema.</li>
                <li><strong className="text-white">Definir el alcance:</strong> Identifica claramente qué funcionalidades se probarán y cuáles quedan fuera.</li>
                <li><strong className="text-white">Pruebas tempranas (Shift-left):</strong> Involúcrate desde el inicio para prevenir defectos de diseño y reducir costes.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b192b]/90 p-5 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-sky-400">2. Planificación y Estrategia</span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><strong className="text-white">Definir la estrategia:</strong> Establece especificaciones y tipos de pruebas (funcionales, no funcionales, caja negra/blanca).</li>
                <li><strong className="text-white">Control continuo:</strong> Supervisa el progreso real respecto al plan para detectar desviaciones a tiempo.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b192b]/90 p-5 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-sky-400">3. Diseño y Desarrollo de Pruebas</span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><strong className="text-white">Creación de casos:</strong> Diseña casos especificando identificador único, precondiciones, pasos y resultados esperados.</li>
                <li><strong className="text-white">Datos y scripts:</strong> Especifica datos de prueba y desarrolla scripts de automatización si aplica.</li>
                <li><strong className="text-white">Pruebas exploratorias:</strong> Explora la aplicación de forma inductiva para descubrir fallos no anticipados.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b192b]/90 p-5 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-sky-400">4. Configuración del Entorno</span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><strong className="text-white">Simular producción:</strong> Prepara y configura un entorno de pruebas que replique con precisión el entorno real de operación.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b192b]/90 p-5 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-sky-400">5. Ejecución y Gestión de Defectos</span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><strong className="text-white">Ejecutar casos:</strong> Corre las pruebas y contrasta los resultados reales frente a los esperados.</li>
                <li><strong className="text-white">Registrar incidencias:</strong> Cataloga severidad (impacto técnico) y prioridad (urgencia comercial).</li>
                <li><strong className="text-white">Retest y Regresión:</strong> Confirma correcciones y verifica que no se introdujeran nuevos errores.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b192b]/90 p-5 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-sky-400">6. Cierre de Pruebas (Test Closure)</span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><strong className="text-white">Verificar entregables:</strong> Confirma que se hayan cumplido los criterios de cierre acordados.</li>
                <li><strong className="text-white">Archivar y documentar:</strong> Guarda planes, casos, scripts y redacta el informe final de resultados.</li>
              </ul>
            </div>

          </div>

          {/* Plantilla Explicativa */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-white">Estructura de la Plantilla de Casos de Prueba</h3>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#07111f]/90 shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/10 bg-[#050b14] text-sky-400 uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3 font-bold">Campo</th>
                    <th className="px-4 py-3 font-bold">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {PLANTILLA_GUIA.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-white font-semibold whitespace-nowrap">{item.campo}</td>
                      <td className="px-4 py-3 text-slate-400">{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 1: FUENTES Y REFERENCIAS */}
      {tabActiva === "fuentes" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Buscar fuente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full sm:w-80 rounded-xl border border-white/10 bg-[#07111f]/90 px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none shadow-lg"
            />
            <div className="flex gap-2 text-xs overflow-x-auto">
              {["Todas", "Documentación", "Estándares & Guías", "Herramientas"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-all whitespace-nowrap ${
                    filtroCategoria === cat
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                      : "bg-[#07111f] text-slate-400 hover:text-white border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fuentesFiltradas.map((fuente) => (
              <div
                key={fuente.id}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-b from-[#0b192b]/90 to-[#07111f]/90 p-5 shadow-lg transition-all hover:border-sky-500/30"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold text-sky-400 border border-sky-500/20">
                      {fuente.categoria}
                    </span>
                    <span className="text-[10px] text-slate-500">{fuente.tipo}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                    {fuente.titulo}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {fuente.descripcion}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5">
                  <a
                    href={fuente.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:underline"
                  >
                    <span>Consultar fuente</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

{/* PESTAÑA 2: CÓMO HACER UN INFORME DE QA CON DESCARGA DE DOCS */}
      {tabActiva === "informe" && (
        <div className="space-y-6 text-xs text-slate-300">
          
          {/* Introducción y Filosofía */}
          <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-500/[0.08] to-[#07111f]/90 p-6 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20">
              GUÍA PRÁCTICA DE TRABAJO
            </span>
            <h2 className="text-lg font-bold text-white">¿Por qué y cuándo hacer un Informe de QA?</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              En la práctica diaria, cuando los excels de casos de prueba se vuelven gigantescos y difíciles de leer, o cuando necesitas probar funcionalidades concretas (como la integración de pagos o un chatbot), un **Informe Ejecutivo de QA** es la mejor herramienta de comunicación directa con los desarrolladores.
            </p>
          </div>

          {/* Pasos para construir el Informe paso a paso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="rounded-2xl border border-white/10 bg-[#0b192b]/90 p-5 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <span>1️⃣</span>
                <h3>Título Claro y Contexto</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Empieza identificando claramente la funcionalidad que estás testeando de forma directa y sin rodeos.
              </p>
              <div className="rounded-lg bg-[#050b14] p-2.5 border border-white/5 font-mono text-[11px] text-sky-300">
                Ejemplo: "Pruebas de la Funcionalidad de Pagos v1.2"
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b192b]/90 p-5 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <span>2️⃣</span>
                <h3>Evidencias Visuales y Chats</h3>
              </div>
              <ul className="space-y-2 text-slate-300 leading-relaxed">
                <li>
                  <strong className="text-white">Capturas Antes / Después:</strong> Muestra el estado del botón/pantalla antes del clic y el resultado obtenido.
                </li>
                <li>
                  <strong className="text-white">Testing de Chatbots / IA:</strong> Incluye la transcripción literal del diálogo junto a tu veredicto:
                  <span className="block italic text-slate-400 mt-1">"La IA responde correctamente" o "La IA alucina y se inventa los datos".</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b192b]/90 p-5 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <span>3️⃣</span>
                <h3>Resumen Formal Superior</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Coloca **arriba del todo** un resumen formal ordenado por nivel de impacto para que los devs sepan qué arreglar primero:
              </p>
              <div className="space-y-1 text-[11px]">
                <div className="text-rose-400 font-medium">🔴 1. Lo que ha ido MAL (Crítico/Revisar)</div>
                <div className="text-amber-300 font-medium">🟡 2. Lo que va MEDIO BIEN / MEDIO MAL</div>
                <div className="text-emerald-400 font-medium">🟢 3. Lo que va BIEN (Conforme)</div>
              </div>
            </div>

          </div>

          {/* DOCUMENTO TIPO DOCS DESCARGABLE */}
          <div className="rounded-2xl border border-white/10 bg-[#07111f]/90 p-6 space-y-5 shadow-2xl">
            
            {/* Cabecera del Documento con Botón de Descarga */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    📄 Documento de Ejemplo (Plantilla)
                  </span>
                  <span className="text-[10px] text-slate-500">Formato listo para Docs / Notion / Markdown</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Informe_QA_Funcionalidad_Pagos_Chatbot.md
                </h3>
              </div>

              <button
                onClick={() => {
                  const contenidoDoc = `# INFORME DE PRUEBAS QA: Funcionalidad de Pagos y Chatbot

**Fecha:** ${new Date().toISOString().split("T")[0]}  
**Módulo:** Pagos / Asistente IA  
**Versión de Build:** 1.2.0  
**Tester Responsable:** Equipo de QA  
**Estado General:** REVISIÓN REQUERIDA (NO-GO)  

---

## 📊 RESUMEN EJECUTIVO

### 🔴 1. Lo que ha ido MAL (Atención Crítica / Blockers)
* **Doble cobro por clic rápido:** El botón de "Pagar con Tarjeta" no se inhabilita al hacer clic, permitiendo realizar múltiple sumisión y generando cargos duplicados en la pasarela.

### 🟡 2. Lo que va MEDIO BIEN / MEDIO MAL
* **Inconsistencia en respuestas del Chatbot (Alucinación):** El asistente responde correctamente sobre la fecha del curso de IA a la primera consulta ("día 28"), pero si el usuario le repregunta o insiste, el bot se inventa que es "el día 15 de cada mes".

### 🟢 3. Lo que va BIEN (Conforme)
* Validación previa de campos del formulario de pago (Email, CVV, Expiración).
* Renderizado correcto del modal de confirmación con el token de transacción.
* Generación del comprobante en PDF descargable.

---

## 🔍 DETALLE DE PRUEBAS Y EVIDENCIAS

### PRUEBA 1: Validación del Botón de Pago
* **Objetivo:** Comprobar comportamiento del botón al ser presionado.
* **Captura Antes:** Estado inactivo / Habilitado.
* **Captura Después:** Sin feedback visual de spinner, permite múltiples clics.
* **Resultado:** FALLIDO.

### PRUEBA 2: Diálogo con Asistente IA (Chatbot)
* **Objetivo:** Verificar precisión en preguntas sobre cursos.
* **Transcripción del Chat:**
  * **Tester:** "¿Cuándo es el curso de IA?"
  * **Chatbot:** "Hola, el curso de IA es el día 28."
  * **Tester:** "¿Seguro que el curso es el día 28?"
  * **Chatbot:** "El curso es el día 15 de cada mes." *(Error / Alucinación de datos)*
* **Resultado:** INESTABLE / ALUCINACIÓN.
`;
                  const blob = new Blob([contenidoDoc], { type: "text/markdown;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", "Informe_QA_Ejemplo.md");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="rounded-xl bg-sky-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-300 transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
              >
                <span>📥 Descargar Plantilla (.md)</span>
              </button>
            </div>

            {/* VISTA PREVIA ESTILO DOCUMENTO (NOTION / GOOGLE DOCS) */}
            <div className="rounded-xl bg-[#050b14] p-6 border border-white/10 space-y-5 font-sans leading-relaxed text-slate-300">
              
              {/* Encabezado del Documento */}
              <div className="border-b border-white/10 pb-4 space-y-1">
                <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                  <span>PROYECTO: SAAS QA MANAGEMENT</span>
                  <span>BUILD: v1.2.0</span>
                </div>
                <h2 className="text-lg font-bold text-white">
                  INFORME DE PRUEBAS QA: Funcionalidad de Pagos y Chatbot
                </h2>
                <div className="flex gap-4 text-[11px] text-slate-400 pt-1">
                  <span><strong>Fecha:</strong> {new Date().toISOString().split("T")[0]}</span>
                  <span><strong>Tester:</strong> QA Senior</span>
                  <span><strong>Estado:</strong> <span className="text-rose-400 font-bold">🔴 REVISIÓN REQUERIDA</span></span>
                </div>
              </div>

              {/* Secciones del Documento */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  📊 Resumen Ejecutivo
                </h3>

                <div className="space-y-2 text-xs bg-[#0b192b]/50 p-4 rounded-xl border border-white/5">
                  <div className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold shrink-0">🔴 1. Lo que ha ido MAL:</span>
                    <span><strong>Doble cobro por clic rápido:</strong> El botón de "Pagar con Tarjeta" no se deshabilita al hacer clic, permitiendo realizar múltiple sumisión y generando cargos duplicados en la pasarela.</span>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <span className="text-amber-300 font-bold shrink-0">🟡 2. Medio bien / Medio mal:</span>
                    <span><strong>Inconsistencia en respuestas del Chatbot (Alucinación):</strong> El asistente responde correctamente sobre la fecha del curso de IA a la primera consulta ("día 28"), pero si el usuario le repregunta o insiste, el bot se inventa que es "el día 15 de cada mes".</span>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <span className="text-emerald-400 font-bold shrink-0">🟢 3. Lo que va BIEN:</span>
                    <span>Validación previa de campos del formulario de pago, modal de confirmación con token de transacción y generación del comprobante en PDF descargable.</span>
                  </div>
                </div>
              </div>

              {/* Detalle y Evidencias en Formato Doc */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  🔍 Detalle de Pruebas y Evidencias
                </h3>

                {/* Bloque Prueba 1 */}
                <div className="p-4 rounded-xl bg-[#0b192b]/30 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="text-white">PRUEBA 1: Comportamiento del Botón de Pago</strong>
                    <span className="text-rose-400 font-mono text-[10px] bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">FALLIDO</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Se probó hacer clic repetido sobre el botón principal en la pasarela.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-1">
                    <div className="p-2 bg-[#050b14] rounded border border-white/5">
                      <span className="text-slate-500 block">Antes del clic:</span>
                      <span>Botón habilitado y activo</span>
                    </div>
                    <div className="p-2 bg-[#050b14] rounded border border-white/5">
                      <span className="text-slate-500 block">Después del clic:</span>
                      <span className="text-rose-300">Sin spinner. Permite re-clic.</span>
                    </div>
                  </div>
                </div>

                {/* Bloque Prueba 2 Chatbot */}
                <div className="p-4 rounded-xl bg-[#0b192b]/30 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="text-white">PRUEBA 2: Diálogo con Asistente IA (Chatbot)</strong>
                    <span className="text-amber-300 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">ALUCINACIÓN</span>
                  </div>
                  <div className="p-3 bg-[#050b14] rounded border border-white/5 font-mono text-[11px] space-y-1">
                    <p className="text-sky-300"><strong>Tester:</strong> "¿Cuándo es el curso de IA?"</p>
                    <p className="text-emerald-300"><strong>Chatbot:</strong> "Hola, el curso de IA es el día 28."</p>
                    <p className="text-sky-300"><strong>Tester:</strong> "¿Seguro que el curso es el día 28?"</p>
                    <p className="text-rose-300"><strong>Chatbot:</strong> "El curso es el día 15 de cada mes." <span className="text-slate-500 italic">(Datos inventados)</span></p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* PESTAÑA 3: ESTRUCTURAR UN EXCEL DE QA */}
      {tabActiva === "excel" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#07111f] p-4 rounded-xl border border-white/10">
            <div>
              <h2 className="text-sm font-bold text-white">Estructura Estándar de Excel de Casos de Prueba</h2>
              <p className="text-xs text-slate-400">
                Plantilla completa con trazabilidad de ejecución (v.1, verificación y v.2).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#07111f]/90 shadow-2xl">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#050b14] text-sky-400 uppercase tracking-wider text-[10px]">
                  {COLUMNAS_EXCEL.map((col, idx) => (
                    <th key={idx} className="whitespace-nowrap px-4 py-3 font-bold border-r border-white/5">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {FILAS_EJEMPLO_EXCEL.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-white font-semibold border-r border-white/5">{row.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-white border-r border-white/5">{row.resumen}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5">{row.modulo}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5">{row.version}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5">{row.funcionalidad}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5">{row.casoPrueba}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5 text-slate-400">{row.precondiciones}</td>
                    <td className="whitespace-pre-line px-4 py-3 border-r border-white/5 min-w-[200px] text-slate-300">{row.pasos}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5 text-slate-400">{row.datosEntrada}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5 text-emerald-300">{row.resultadoEsperado}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5 text-slate-300">{row.resultadoObtenido}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5">{row.tipoIncidencia}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5">{row.categoria}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        {row.estadoV1}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5">{row.responsable}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5">{row.fecha}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5 text-slate-400">{row.observaciones}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5 font-bold text-sky-400">{row.verificacion}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5 text-slate-400">{row.obsFechaVerif}</td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5">
                      <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/20">
                        {row.estadoV2}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 border-r border-white/5 text-slate-400">{row.obsV2}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">{row.fechaEstadoV2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}