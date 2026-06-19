<!--
  FUENTE DE VERDAD del asistente del portfolio.
  Editá este archivo para actualizar lo que el chatbot sabe sobre JP, commiteá y
  redesplegá. No hace falta tocar código.
  Última actualización del contenido: 2026-06.
-->

# Perfil de Juan Pablo Manzano (JP)

## Resumen
Ingeniero Industrial y **Data Engineer**. Transformo datos en soluciones estratégicas:
diseño e implemento **data warehouses** y **pipelines escalables**, automatizo y orquesto
procesos, y construyo aplicaciones **data-driven** end-to-end. Trabajo principalmente sobre
**GCP** con Python, SQL, BigQuery, Apache Airflow, Cloud Run y N8N, y cada vez más con
**IA aplicada** (RAG, MCPs, agentes).

Autodidacta y proactivo, me adapto a entornos dinámicos y resuelvo problemas complejos de
forma creativa. Basado en Mendoza, Argentina.

## Contacto
- Email: jpmanzano95@gmail.com
- LinkedIn: https://linkedin.com/in/juanpablomanzano
- GitHub: https://github.com/juampa95

## Experiencia

### Market One — Data Engineer · 04-2025 a la actualidad
Consultoría de datos. Trabajo en la plataforma de datos interna y en proyectos para clientes.

**Plataforma de datos interna**

- **Data Warehouse en BigQuery (arquitectura Medallion)** · 06-2026 → presente *(en progreso)*
  DWH con capas bronze (ingesta), silver (transformación / capas intermedias) y gold
  (lógica de negocio). Orquestación y scheduling íntegros en GCP.
  *Stack: Python, BigQuery, Cloud Run Jobs, GCP Workflows, Cloud Scheduler.*

- **MCPs para consulta de datos en tiempo real** · 2026 → presente *(en progreso)*
  Serie de servidores **MCP (Model Context Protocol)** que permiten a los integrantes de la
  empresa consultar datos desde Claude/ChatGPT/etc. en tiempo real, sobre múltiples fuentes:
  COR (PMO), Finnegans (finanzas), Notion (base de conocimiento), Bitrix (trazabilidad de
  procesos comerciales: leads y deals) y tablas de BigQuery del data warehouse.
  *Stack: FastMCP (Python), BigQuery, Cloud Run Jobs, Secret Manager (GCP), OAuth.*

- **Sistema de scoring interno de colaboradores** · 04-2025 → presente
  Diseño, desarrollo y mantenimiento sobre fuentes heterogéneas, orquestado con Apache
  Airflow. −80% en tiempos de ejecución y trazabilidad. Resultados en BigQuery para Power BI.
  *Stack: Python, SQL, Apache Airflow, BigQuery, APIs REST, Notion, SharePoint, Power BI.*

- **Webapp interna (hub de herramientas + automatizaciones)** · 04-2025 → presente
  Centraliza herramientas corporativas, dashboards de Power BI embebidos con filtros dinámicos
  por usuario y ejecución on-demand de automatizaciones (Jobs en Cloud Run), con auth en Firestore.
  *Stack: Python (Flask), HTML, CSS, JavaScript, Bootstrap, Firestore, Power BI Embedding.*

- **Agente AI (RAG) contextualizado a la lógica de negocio** · 07-2025 → presente
  RAG en N8N con entrenamiento automático desde PDFs de SharePoint y base de contexto dinámica;
  chatbot interno. Orquestado con Docker Compose y desplegado en GCP (VM).
  *Stack: JavaScript, PostgreSQL (pgvector), N8N, API OpenAI, Notion, SharePoint, GCP, VM.*

- **Optimización y migración de apps internas a microservicios** · 08-2025 → presente
  Migración de una webapp a microservicios con Docker Compose y procesos asíncronos
  (on-demand y periódicos). −90% en tiempos de espera.
  *Stack: Docker, GCP, VM, PostgreSQL, Webhooks, Python, FastAPI.*

- **Automatización de procesos internos on-demand** · 04-2025 → 07-2025
  Automatizaciones para tareas repetitivas (carga horaria, reportes a líderes, gestión de
  insumos) empaquetadas en Docker (Artifact Registry) y desplegadas como Jobs en Cloud Run,
  con ejecución desde una web interna y resultados por correo.
  *Stack: Python, Docker, GCP Cloud Run, Artifact Registry, APIs REST.*

**Proyectos con clientes**

- **Road To Market — Sudáfrica (webapp full-stack data-driven)** · 03-2026 → 07-2026 *(finalizando)*
  Aplicación que **simula escenarios de go-to-market** en función de los datos que el cliente
  carga en la misma webapp. Cliente de consumo masivo. Arquitectura completa en una VM de GCP,
  con todos los servicios en Docker Compose y CI/CD.
  *Stack: React + TypeScript (front), FastAPI/Python (back), Redis (sesiones y cálculos),
  PostgreSQL (en VM), observabilidad con Grafana, Loki, Prometheus, node-exporter, Alloy y
  cAdvisor, Caddy (reverse proxy), Docker Compose, GitHub Actions (CI/CD + tests).*

- **Migración serverless → stack en VM** · 01-2026 → 02-2026
  Migración de una app de GCP Cloud Run Services a un stack en VM con Docker Compose (similar
  al de la webapp de GTM de Sudáfrica). Fue el proyecto que dio pie a adoptar ese stack.
  *Stack: GCP (Cloud Run Services → VM), Docker Compose, Python.*

- **Road To Market — Centroamérica (4 proyectos)** · 11-2025 → 02-2026
  Análisis y modelado de Road To Market para una empresa de consumo masivo, con datos tratados
  en Python y entregables en Power BI.
  *Stack: Python, SQL, Power BI.*

- **Extracción y procesamiento paralelizado (segmentación de clientes)** · 05-2025
  Extracción desde múltiples bases del cliente y carga en streaming a BigQuery desde una VM
  dedicada, con procesamiento por lotes y paralelización.
  *Stack: Python, SQL, BigQuery (streaming), VMs, procesamiento paralelo.*

### Empresa de servicios para call-centers (BPO) — Desarrollador IA, Nodo de IA · 04-2026 a la actualidad *(en paralelo a Market One)*
Parte del nodo de IA interno de la empresa, donde además **lidero algunas iniciativas**.
Aplicación de IA al proceso productivo: detección de insights y generación de recomendaciones.
*Stack: Python, GCP serverless (Cloud Run Jobs y Services, Cloud Scheduler), SQL, BigQuery,
Apache Airflow (orquestación de una DAG).*

### Market One — Data Analyst · 01-2024 a 03-2025
Análisis y reporting para proyectos de segmentación, pricing y go-to-market: limpieza y
preparación de datos en Python, generación de insights y visualización en Power BI.
*Stack: Python, Power BI, Excel.*

### Sistemas de Embalajes S.A. (ONELITE) — Ingeniero Industrial Junior, Oficina Técnica · 09-2022 a 01-2024
Desarrollo de productos, testeo de software y optimización de procesos operativos.

### Autosur S.R.L. — Administrativo Contable / Encargado de Pagos · 12-2014 a 08-2022
Gestión administrativa y contable: comunicación con proveedores y seguimiento de pagos.

## Formación
- **UTN (Mendoza)** — Ingeniero Industrial, promedio 8.80 (08-2022).
- **ENET (Mendoza)** — Técnico Electromecánico, promedio 8.96 (12-2014).
- **UTN** — Diplomatura en Machine Learning (07-2023).
- **UTN** — Python: Introducción, 500 horas (07-2022).
- **CoderHouse (Buenos Aires)** — Carrera Data Scientist (05-2023), Data Analytics (08-2022).

## Habilidades
- **Data Engineering / Warehousing:** BigQuery, arquitectura Medallion (bronze/silver/gold),
  pipelines ETL/ELT, procesamiento paralelo y streaming.
- **Orquestación:** Apache Airflow, GCP Workflows, Cloud Scheduler, Cloud Run Jobs, N8N.
- **IA aplicada:** MCPs (FastMCP), RAG (N8N + pgvector), integración con Claude/ChatGPT y
  API OpenAI, generación de insights y recomendaciones.
- **Backend / Web:** Python (FastAPI, Flask), React + TypeScript, SQL, APIs REST.
- **Infra / DevOps:** Docker y Docker Compose, VMs en GCP, Caddy, Redis, CI/CD con GitHub Actions.
- **Observabilidad:** Grafana, Loki, Prometheus, node-exporter, Alloy, cAdvisor.
- **Cloud (GCP):** BigQuery, Firestore, Cloud Run (Services y Jobs), Workflows, Scheduler,
  Artifact Registry, Secret Manager, IAM, VMs. Familiaridad con AWS (Lambda, S3, EventBridge).
- **Análisis / BI:** Power BI, Python (limpieza y análisis), Machine Learning, Tableau.
- **Lenguajes y herramientas:** Python, SQL, JavaScript/TypeScript, HTML, CSS, Git/GitHub,
  Zapier, Web Scraping.
