// FUENTE DE VERDAD del timeline de Trayectoria (sección de la home).
// Es data estructurada a propósito (no se parsea perfil.md, que es prosa para el chatbot).
// `start` (AAAA-MM) se usa para ordenar y para ubicar cada item en el eje de años;
// lo que se muestra como rango es `period`.
//
// NOTA: las fechas deben quedar alineadas con content/perfil.md. Si JP ajusta fechas de
// fin de los proyectos 2025 en perfil.md, reflejarlas también acá.

// Carriles paralelos (un color por contexto). Todos comparten el MISMO eje de años.
// `group` une carriles bajo un encabezado grande (ej. las 2 ramas de Market One);
// `label` es el sublabel del carril dentro del grupo (o el encabezado si no hay grupo).
export const TRACKS = [
  { id: 'mo-plat', group: 'Market One', label: 'Interno', accent: '#6d5dfc' },
  { id: 'mo-cli', group: 'Market One', label: 'Clientes', accent: '#ff5d9e' },
  { id: 'bpo', label: 'Nodo de IA · BPO', accent: '#36d399' },
  { id: 'formacion', label: 'Formación', accent: '#5ddcff' },
]

// Cada item es una card mínima en su carril; `detail` alimenta el panel de la derecha.
export const TRAYECTORIA = [
  // ----- Market One · Plataforma interna -----
  {
    id: 'dwh',
    track: 'mo-plat',
    period: '2026 → hoy',
    start: '2026-06',
    current: true,
    title: 'Data Warehouse (Medallion)',
    org: 'Market One',
    stack: ['Python', 'BigQuery', 'Cloud Run Jobs', 'GCP Workflows', 'Cloud Scheduler'],
    detail:
      'DWH en BigQuery con capas bronze (ingesta), silver (transformación / capas intermedias) y gold (lógica de negocio). Orquestación y scheduling íntegros en GCP.',
  },
  {
    id: 'mcps',
    track: 'mo-plat',
    period: '2026 → hoy',
    start: '2026-01',
    current: true,
    title: 'MCPs para consultar datos con IA',
    org: 'Market One',
    stack: ['FastMCP', 'BigQuery', 'Cloud Run', 'Secret Manager', 'OAuth'],
    detail:
      'Servidores MCP (Model Context Protocol) que permiten consultar datos en tiempo real —COR, Finnegans, Notion, Bitrix y BigQuery— desde Claude/ChatGPT.',
  },
  {
    id: 'scoring',
    track: 'mo-plat',
    period: 'abr–dic 2025',
    start: '2025-04',
    title: 'Scoring de colaboradores',
    org: 'Market One',
    stack: ['Python', 'Apache Airflow', 'BigQuery', 'Power BI'],
    detail:
      'Pipeline sobre fuentes heterogéneas orquestado con Apache Airflow. −80% en tiempos de ejecución y mejor trazabilidad; resultados en BigQuery para Power BI.',
  },
  {
    id: 'rag',
    track: 'mo-plat',
    period: 'jul–dic 2025',
    start: '2025-07',
    title: 'Agente RAG de negocio',
    org: 'Market One',
    stack: ['N8N', 'pgvector', 'API OpenAI', 'Docker', 'GCP VM'],
    detail:
      'RAG en N8N con entrenamiento automático desde PDFs de SharePoint y base de contexto dinámica. Chatbot interno orquestado con Docker Compose y desplegado en VM de GCP.',
  },
  {
    id: 'micros',
    track: 'mo-plat',
    period: 'ago–oct 2025',
    start: '2025-08',
    title: 'Migración a microservicios',
    org: 'Market One',
    stack: ['Docker Compose', 'FastAPI', 'PostgreSQL', 'Webhooks', 'GCP VM'],
    detail:
      'Migración de una webapp interna a microservicios con Docker Compose y procesos asíncronos (on-demand y periódicos). −90% en tiempos de espera.',
  },
  {
    id: 'hub',
    track: 'mo-plat',
    period: 'abr–jun 2025',
    start: '2025-04',
    title: 'Hub de herramientas internas',
    org: 'Market One',
    stack: ['Flask', 'JavaScript', 'Power BI Embedding', 'Firestore'],
    detail:
      'Webapp que centraliza herramientas corporativas. Capa de control de acceso externa, en JavaScript, sobre dashboards de Power BI embebidos: filtra por usuario qué tablero y qué datos ve cada persona —acceso granular sin una licencia premium por persona—. Suma automatizaciones on-demand (Jobs en Cloud Run).',
  },
  {
    id: 'autom',
    track: 'mo-plat',
    period: 'abr–jul 2025',
    start: '2025-04',
    title: 'Automatizaciones on-demand',
    org: 'Market One',
    stack: ['Python', 'Docker', 'Cloud Run Jobs', 'Artifact Registry', 'APIs REST'],
    detail:
      'Automatizaciones para tareas repetitivas (carga horaria, reportes a líderes, gestión de insumos) empaquetadas en Docker y desplegadas como Jobs en Cloud Run, disparadas desde una web interna y con resultados por correo.',
  },

  // ----- Market One · Clientes -----
  {
    id: 'rtm-sa',
    track: 'mo-cli',
    period: 'mar–jul 2026',
    start: '2026-03',
    title: 'Simulador Go-to-Market — Sudáfrica',
    org: 'Cliente de consumo masivo',
    stack: ['React + TS', 'FastAPI', 'Redis', 'PostgreSQL', 'Grafana/Loki/Prometheus', 'Caddy', 'Docker Compose', 'GitHub Actions'],
    detail:
      'Webapp data-driven que simula escenarios de go-to-market según los datos que el cliente carga en la misma app. Arquitectura completa en una VM de GCP con Docker Compose, observabilidad y CI/CD.',
  },
  {
    id: 'serverless-vm',
    track: 'mo-cli',
    period: 'ene–feb 2026',
    start: '2026-01',
    title: 'Migración serverless → VM',
    org: 'Cliente',
    stack: ['GCP', 'Docker Compose', 'Python'],
    detail:
      'Migración de una app de Cloud Run Services a un stack en VM con Docker Compose. Fue el proyecto que dio pie a adoptar ese stack en los desarrollos siguientes.',
  },
  {
    id: 'rtm-ca',
    track: 'mo-cli',
    period: 'nov 2025 – feb 2026',
    start: '2025-11',
    title: 'Road To Market — Centroamérica',
    org: 'Cliente de consumo masivo',
    stack: ['Python', 'SQL', 'Power BI'],
    detail:
      'Análisis y modelado de Road To Market para una empresa de consumo masivo (4 proyectos), con datos tratados en Python y entregables en Power BI.',
  },
  {
    id: 'extraccion',
    track: 'mo-cli',
    period: 'may 2025',
    start: '2025-05',
    title: 'Extracción paralelizada (segmentación)',
    org: 'Cliente',
    stack: ['Python', 'SQL', 'BigQuery (streaming)', 'VMs'],
    detail:
      'Extracción desde múltiples bases del cliente (Hana SAP, Azure) y carga en streaming a BigQuery desde una VM dedicada, con procesamiento por lotes y paralelización.',
  },
  {
    id: 'analyst',
    track: 'mo-cli',
    period: 'ene 2024 – mar 2025',
    start: '2024-01',
    title: 'Data Analyst',
    org: 'Market One',
    stack: ['Python', 'Power BI', 'Excel', 'Trabajo en equipo'],
    detail:
      'Varios proyectos de análisis y reporting para clientes de consumo masivo: limpieza y preparación de bases en Python, comprensión de la lógica de negocio y generación de insights para el equipo de consultores, visualizados en tableros de Power BI. Abordé segmentación de clientes, estrategias de pricing, Road To Market y priorización de portafolios, con resultados a medida de cada cliente.',
  },

  // ----- Nodo de IA · BPO (en paralelo) -----
  {
    id: 'bpo-ia',
    track: 'bpo',
    period: '2026 → hoy',
    start: '2026-04',
    current: true,
    note: 'en paralelo a Market One',
    title: 'Desarrollador IA · Nodo de IA',
    org: 'Empresa de call-centers (BPO)',
    stack: ['Python', 'Cloud Run', 'Cloud Scheduler', 'BigQuery', 'Apache Airflow'],
    detail:
      'Parte del nodo de IA interno, donde además lidero algunas iniciativas. IA aplicada al proceso productivo: detección de insights y generación de recomendaciones.',
  },

  // ----- Formación -----
  {
    id: 'ds',
    track: 'formacion',
    period: '2023',
    start: '2023-01',
    title: 'Data Scientist & Machine Learning',
    org: 'CoderHouse · UTN',
    stack: ['Python', 'Machine Learning'],
    detail:
      'Carrera de Data Scientist (CoderHouse) y Diplomatura en Machine Learning (UTN): el salto formal hacia la ciencia y la ingeniería de datos.',
  },
  {
    id: 'ind',
    track: 'formacion',
    period: '2022',
    start: '2022-08',
    title: 'Ingeniero Industrial',
    org: 'UTN — promedio 8.80',
    stack: [],
    detail:
      'Título de grado e inicio de la transición desde la ingeniería industrial hacia la ingeniería de datos.',
  },
]
