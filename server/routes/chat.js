import { Router } from 'express'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenAI } from '@google/genai'
import { getMetrics } from '../store.js'

const router = Router()

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

// Perfil de JP como fuente de contexto del chatbot. JP lo mantiene editando
// content/perfil.md (se lee al arrancar; un redeploy toma los cambios).
const __dirname = path.dirname(fileURLToPath(import.meta.url))
let perfil = ''
try {
  perfil = readFileSync(path.join(__dirname, '..', '..', 'content', 'perfil.md'), 'utf8')
} catch {
  perfil = '' // sin perfil, el bot responde solo con las métricas de GitHub
}

// Construye el system prompt incluyendo datos reales de GitHub + el "catálogo"
// A2UI que la LLM puede usar para generar UI nativa (no solo texto).
function buildSystemPrompt(m) {
  let ghContext = 'No hay métricas disponibles.'
  if (m?.summary) {
    const langs = (m.languages || []).map((l) => `${l.language} ${l.percentage}%`).join(', ')
    const orgs = (m.organizations || []).map((o) => `${o.name}: ${o.commits} commits`).join(', ')
    const months = (m.contributionsByMonth || []).map((x) => `${x.month}: ${x.contributions}`).join(', ')
    ghContext = `Métricas de GitHub de JP (último año, datos privados ya anonimizados):
- Commits: ${m.summary.commits}, PRs: ${m.summary.prs}, Issues: ${m.summary.issues}, Reviews: ${m.summary.reviews}
- Repos: ${m.summary.repositories}, Organizaciones: ${m.summary.organizations}
- Lenguajes: ${langs}
- Por organización: ${orgs}
- Contribuciones por mes: ${months}`
  }

  return `Sos el asistente del portfolio de Juan Pablo Manzano (JP), Ingeniero Industrial y
Data Engineer. Respondés preguntas de visitantes (reclutadores, colegas) sobre su perfil,
experiencia, proyectos y skills. Tono cercano, profesional y conciso, en español.
Si te preguntan algo que NO está en la info de abajo, decí con honestidad que no lo sabés con
certeza y sugerí contactarlo por email o LinkedIn. No inventes datos.

=== PERFIL DE JP (fuente: su CV, lo mantiene él) ===
${perfil || 'Perfil no disponible por ahora.'}

=== MÉTRICAS DE GITHUB (último año, datos reales ya anonimizados) ===
${ghContext}

FORMATO DE RESPUESTA — devolvés SIEMPRE un JSON con esta forma:
{ "reply": "texto corto para el usuario", "components": <array de componentes A2UI o null> }

Cuando la pregunta se beneficie de un gráfico o tarjeta visual (stats, lenguajes, actividad,
proyectos), generá "components". Si una respuesta de texto alcanza, poné "components": null.

"components" es un array PLANO de componentes (protocolo A2UI v0.9). Cada componente es:
{ "component": "<Tipo>", "id": "<id único>", ...props }

REGLA RAÍZ: exactamente UN componente debe tener "id": "root" — es el contenedor de todo
(normalmente un Card o Column). Los hijos se referencian por id, nunca se anidan inline.

Componentes disponibles (usá EXACTAMENTE estos nombres de props):
- Card:   { "component": "Card",   "id": "x", "child": "<id>" }            (un solo hijo)
- Column: { "component": "Column", "id": "x", "children": ["id1","id2"] }  (apila vertical)
- Row:    { "component": "Row",    "id": "x", "children": ["id1","id2"] }  (en fila)
- Text:   { "component": "Text",   "id": "x", "text": "contenido", "variant": "h3" }
  → variant es OPCIONAL: h1, h2, h3, h4, h5, caption o body.
  → IMPORTANTE: con variant de título (h1..h5) usá TEXTO PLANO, sin ** de markdown
    (el variant ya lo estiliza). El markdown (negritas **, listas) solo funciona en variant body.
- Divider:{ "component": "Divider","id": "x" }
- SparkBars: { "component": "SparkBars", "id": "x", "values": [n1,n2,...], "labels": ["a","b"], "color": "#6d5dfc", "caption": "título" }
  → mini bar chart custom. Ideal para % de lenguajes o conteos (commits/PRs/issues).
  → IMPORTANTE: agrupá métricas relacionadas en UN SOLO SparkBars con varios values/labels
    (ej: commits, PRs, issues y reviews juntos en un chart). NUNCA hagas un SparkBars por métrica.

REGLAS:
- "text" es un string pelado; "children" es un array pelado de ids; "values" son números planos.
- Usá SOLO literales (nunca data paths {"path":...}). Máximo ~7 componentes, sé compacto.
- No inventes datos que no estén en DATOS REALES.

Ejemplo (pregunta: "qué lenguajes usás?"):
{ "reply": "Estos son los lenguajes que más uso 👇", "components": [
  { "component": "Card",   "id": "root", "child": "col" },
  { "component": "Column", "id": "col",  "children": ["t","chart"] },
  { "component": "Text",   "id": "t",    "text": "Lenguajes más usados", "variant": "h3" },
  { "component": "SparkBars", "id": "chart", "values": [40,30,20,10], "labels": ["JS","TS","CSS","HTML"], "color": "#6d5dfc", "caption": "% de uso" }
] }`
}

// Clasifica el error de la API para reaccionar distinto:
// - 'quota'      → cupo (diario) agotado del free tier (429 RESOURCE_EXHAUSTED).
// - 'overloaded' → sobrecarga puntual del modelo (503).
// - 'other'      → cualquier otra cosa.
function classifyError(e) {
  const status = e?.status ?? e?.code
  const msg = String(e?.message || '')
  if (status === 429 || /\b429\b|RESOURCE_EXHAUSTED|exceeded your current quota/i.test(msg)) {
    return 'quota'
  }
  if (status === 503 || /\b503\b|UNAVAILABLE|overloaded|high demand/i.test(msg)) {
    return 'overloaded'
  }
  return 'other'
}

// Solo reintentamos ante sobrecarga puntual (503). Ante cupo agotado (429) NO:
// no ayuda y encima gastaría otro request del cupo diario.
async function generateWithRetry(args, tries = 2) {
  let lastErr
  for (let i = 0; i < tries; i++) {
    try {
      return await ai.models.generateContent(args)
    } catch (e) {
      lastErr = e
      if (classifyError(e) !== 'overloaded' || i === tries - 1) throw e
      await new Promise((r) => setTimeout(r, 800)) // breve espera y reintento
    }
  }
  throw lastErr
}

// Envuelve el array plano de componentes de la LLM en la secuencia de mensajes
// que espera el cliente A2UI v0.9: crear la surface + cargar los componentes.
function buildSurfaceMessages(components) {
  const surfaceId = 's1'
  return [
    { version: 'v0.9', createSurface: { surfaceId, catalogId: 'portfolio' } },
    { version: 'v0.9', updateComponents: { surfaceId, components } },
  ]
}

router.post('/', async (req, res) => {
  const { message, history = [] } = req.body || {}

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Falta el campo "message".' })
  }

  if (!ai) {
    return res.json({
      reply:
        'El chatbot todavía no está configurado (falta GEMINI_API_KEY). Igual podés escribirme y con gusto te respondo 👋',
    })
  }

  let gh = null
  try {
    gh = await getMetrics()
  } catch {
    /* seguimos sin métricas */
  }

  try {
    const contents = [
      ...history.slice(-8).map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(h.text || '').slice(0, 1000) }],
      })),
      { role: 'user', parts: [{ text: message.slice(0, 1000) }] },
    ]

    const response = await generateWithRetry({
      model,
      contents,
      config: {
        systemInstruction: buildSystemPrompt(gh),
        maxOutputTokens: 2048,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    })

    // La respuesta es JSON ({reply, components}); parseamos con tolerancia a fallos.
    let reply = 'No pude generar una respuesta.'
    let ui = null
    try {
      const parsed = JSON.parse(response.text)
      reply = parsed.reply || reply
      const comps = Array.isArray(parsed.components) ? parsed.components : null
      ui = comps && comps.length ? buildSurfaceMessages(comps) : null
    } catch {
      // JSON inválido (p.ej. respuesta truncada): rescatamos el "reply" si se puede,
      // pero NUNCA mostramos el JSON crudo a un visitante.
      const m = /"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(response.text || '')
      reply = m
        ? m[1].replace(/\\"/g, '"').replace(/\\n/g, ' ')
        : 'Tengo la info pero se me complicó armar el gráfico 😅 ¿Probás preguntándomelo de otra forma?'
      ui = null
    }

    res.json({ reply, ui })
  } catch (e) {
    console.error('[chat]', e.message)
    const kind = classifyError(e)
    const reply =
      kind === 'quota'
        ? 'El asistente llegó a su límite de uso gratuito por hoy 🙏 Probá de nuevo mañana.'
        : kind === 'overloaded'
          ? 'Uf, justo hay mucha demanda y el asistente está saturado 😅 Dame unos segundos y volvé a probar.'
          : 'Tuve un problemita para responder ahora mismo. Probá de nuevo en un rato 🙏'
    res.json({ reply, ui: null })
  }
})

export default router
