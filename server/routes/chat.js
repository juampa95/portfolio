import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'
import { getMetrics } from '../store.js'

const router = Router()

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

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

  return `Sos el asistente del portfolio de JP, un desarrollador full-stack al que le gustan
el frontend con animaciones y el backend serverless. Respondés en español, tono cercano y conciso.

DATOS REALES:
${ghContext}

FORMATO DE RESPUESTA — devolvés SIEMPRE un JSON con esta forma:
{ "reply": "texto corto para el usuario", "ui": <surface A2UI o null> }

Cuando la pregunta se beneficie de un gráfico o tarjeta visual (stats, lenguajes, actividad,
proyectos), generá una "ui" A2UI. Si una respuesta de texto alcanza, poné "ui": null.

Una surface A2UI es: { "root": "<id raíz>", "components": [ {"id":"x","component":{"Tipo":{...props}}} ], "data": {} }

Componentes disponibles:
- Card: { "child": "<id>" }            (contenedor con borde)
- Column: { "children": ["id1","id2"] }
- Row: { "children": ["id1","id2"] }
- Text: { "text": "contenido (soporta markdown)" }
- Divider: {}
- SparkBars: { "values": [n1,n2,...], "labels": ["a","b",...], "color": "#6d5dfc", "caption": "título" }
  → un mini bar chart. Usalo para porcentajes de lenguajes o conteos (commits/PRs/issues).

REGLAS:
- Usá SOLO valores literales (números/strings), nunca data paths.
- El "root" debe ser el id de un Card o Column que contenga al resto.
- Para charts de lenguajes/actividad usá SparkBars con datos reales de arriba.
- Máximo ~8 componentes. No inventes datos que no estén en DATOS REALES.

Ejemplo (pregunta: "qué lenguajes usás?"):
{ "reply": "Estos son los lenguajes que más uso 👇", "ui": {
  "root": "card",
  "components": [
    {"id":"card","component":{"Card":{"child":"col"}}},
    {"id":"col","component":{"Column":{"children":["t","chart"]}}},
    {"id":"t","component":{"Text":{"text":"**Lenguajes más usados**"}}},
    {"id":"chart","component":{"SparkBars":{"values":[40,30,20,10],"labels":["JS","TS","CSS","HTML"],"color":"#6d5dfc","caption":"% de uso"}}}
  ],
  "data": {}
}}`
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

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: buildSystemPrompt(gh),
        maxOutputTokens: 1200,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    })

    // La respuesta es JSON ({reply, ui}); parseamos con tolerancia a fallos.
    let reply = 'No pude generar una respuesta.'
    let ui = null
    try {
      const parsed = JSON.parse(response.text)
      reply = parsed.reply || reply
      ui = parsed.ui && parsed.ui.root ? parsed.ui : null
    } catch {
      reply = response.text || reply // si no es JSON, mostramos el texto crudo
    }

    res.json({ reply, ui })
  } catch (e) {
    console.error('[chat]', e.message)
    res.status(500).json({ error: 'Error consultando el modelo. Probá más tarde.' })
  }
})

export default router
