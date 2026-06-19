// Fixture de métricas usado como fallback cuando no hay Firestore (dev/Docker local).
// Define el "contrato" de datos que genera la GitHub Action y consume el frontend.
// En producción, este mismo shape se lee desde Firestore (doc metrics/latest).

function buildSampleHeatmap() {
  const weeks = []
  const today = new Date()
  for (let w = 52; w >= 0; w--) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(today)
      date.setDate(today.getDate() - (w * 7 + (6 - d)))
      const count = Math.max(0, Math.round((Math.sin(w / 3) + 1) * 4 + (Math.random() * 4 - 2)))
      const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4
      week.push({ date: date.toISOString().slice(0, 10), count, level })
    }
    // Mismo shape que el real: cada semana es { days: [...] } (Firestore no
    // permite arrays anidados).
    weeks.push({ days: week })
  }
  return { weeks, total: 1842 }
}

export const sampleMetrics = {
  generatedAt: new Date().toISOString(),
  sample: true,
  user: { login: 'demo' },
  summary: {
    commits: 2841,
    prs: 412,
    reviews: 538,
    issues: 120,
    repositories: 37,
    organizations: 4,
    languages: 8,
  },
  languages: [
    { language: 'Python', percentage: 38, color: '#3572A5' },
    { language: 'TypeScript', percentage: 27, color: '#3178c6' },
    { language: 'JavaScript', percentage: 15, color: '#f1e05a' },
    { language: 'SQL', percentage: 10, color: '#e38c00' },
    { language: 'Go', percentage: 6, color: '#00ADD8' },
    { language: 'CSS', percentage: 4, color: '#563d7c' },
  ],
  organizations: [
    { name: 'Personal', commits: 623 },
    { name: 'Organización #1', commits: 1384 },
    { name: 'Organización #2', commits: 612 },
    { name: 'Organización #3', commits: 222 },
  ],
  repositories: [
    { name: 'portfolio', private: false, commits: 87, prs: 14 },
    { name: 'anime-experiments', private: false, commits: 54, prs: 6 },
    { name: 'a2ui-playground', private: false, commits: 41, prs: 9 },
    { name: 'Proyecto privado #1', private: true, commits: 512, prs: 48 },
    { name: 'Proyecto privado #2', private: true, commits: 318, prs: 27 },
  ],
  heatmap: buildSampleHeatmap(),
  contributionsByMonth: [
    { month: '2026-01', contributions: 103 },
    { month: '2026-02', contributions: 145 },
    { month: '2026-03', contributions: 178 },
    { month: '2026-04', contributions: 132 },
    { month: '2026-05', contributions: 201 },
    { month: '2026-06', contributions: 96 },
  ],
}
