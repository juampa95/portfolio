// Almacenamiento con Firestore en producción (Cloud Run) y fallback en
// memoria para desarrollo local sin credenciales. Así el contenedor corre
// igual en local que en la nube, y en Cloud Run persiste de verdad.

import { Firestore } from '@google-cloud/firestore'
import { sampleMetrics } from './sample-metrics.js'

// Cloud Run setea K_SERVICE. En local activás Firestore con FIRESTORE_ENABLED=true.
const onCloudRun = !!process.env.K_SERVICE
const useFirestore = onCloudRun || process.env.FIRESTORE_ENABLED === 'true'

let db = null
if (useFirestore) {
  try {
    db = new Firestore()
    console.log('[store] Firestore habilitado (persistencia real)')
  } catch (e) {
    console.warn('[store] no pude iniciar Firestore, uso memoria:', e.message)
  }
}
if (!db) {
  console.log('[store] usando almacenamiento en memoria (sin persistencia)')
}

// --- Fallback en memoria ---
const mem = { views: 0, guestbook: [] }

export async function incrementViews() {
  if (db) {
    const ref = db.collection('counters').doc('siteViews')
    await ref.set({ count: Firestore.FieldValue.increment(1) }, { merge: true })
    const snap = await ref.get()
    return snap.data().count
  }
  return ++mem.views
}

export async function getViews() {
  if (db) {
    const snap = await db.collection('counters').doc('siteViews').get()
    return snap.exists ? snap.data().count : 0
  }
  return mem.views
}

export async function addGuestbookEntry({ name, message }) {
  const entry = { name, message, createdAt: new Date().toISOString() }
  if (db) {
    await db.collection('guestbook').add({
      name,
      message,
      createdAt: Firestore.FieldValue.serverTimestamp(),
    })
    return entry
  }
  mem.guestbook.unshift(entry)
  return entry
}

// --- Métricas de GitHub (generadas por la Action, leídas en runtime) ---

export async function getMetrics() {
  if (db) {
    const snap = await db.collection('metrics').doc('latest').get()
    if (snap.exists) return snap.data()
  }
  // Sin Firestore o sin doc todavía: devolvemos el fixture de ejemplo.
  return sampleMetrics
}

// Usado por el script de la GitHub Action para guardar el snapshot diario.
export async function saveMetrics(metrics) {
  if (!db) throw new Error('Firestore no está habilitado (falta entorno GCP).')
  await db.collection('metrics').doc('latest').set(metrics)
  // Histórico ligero: un doc por día (opcional, no rompe si falla).
  const day = new Date().toISOString().slice(0, 10)
  await db.collection('metrics').doc('latest').collection('history').doc(day).set(metrics)
}

export async function getGuestbookEntries(limit = 50) {
  if (db) {
    const snap = await db
      .collection('guestbook')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()
    return snap.docs.map((d) => {
      const x = d.data()
      return {
        name: x.name,
        message: x.message,
        createdAt: x.createdAt?.toDate?.().toISOString?.() ?? null,
      }
    })
  }
  return mem.guestbook.slice(0, limit)
}
