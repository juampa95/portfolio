/**
 * Recolecta métricas de GitHub (incluyendo repos privados/de organizaciones),
 * las normaliza, anonimiza lo privado, y guarda un snapshot en Firestore.
 *
 * Corre en la GitHub Action (NO en runtime). Requiere:
 *   - GH_METRICS_TOKEN   PAT clásico con scopes: repo, read:org, read:user
 *   - GOOGLE_CLOUD_PROJECT + credenciales GCP (ADC vía Workload Identity)
 *   - FIRESTORE_ENABLED=true
 * Opcional:
 *   - GH_PUBLIC_ORGS     logins de orgs a mostrar con nombre real (coma-separados)
 */
import { saveMetrics } from '../server/store.js'

const token = process.env.GH_METRICS_TOKEN
const publicOrgs = new Set(
  (process.env.GH_PUBLIC_ORGS || '').split(',').map((s) => s.trim()).filter(Boolean),
)

const GQL = `
query ($from: DateTime!, $to: DateTime!) {
  viewer {
    login
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
      commitContributionsByRepository(maxRepositories: 100) {
        contributions { totalCount }
        repository {
          name
          isPrivate
          owner { login }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name color } }
          }
        }
      }
      pullRequestContributionsByRepository(maxRepositories: 100) {
        contributions { totalCount }
        repository { name owner { login } }
      }
    }
  }
}`

async function fetchGitHub() {
  const to = new Date()
  const from = new Date(to)
  from.setFullYear(to.getFullYear() - 1)

  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-metrics',
    },
    body: JSON.stringify({ query: GQL, variables: { from: from.toISOString(), to: to.toISOString() } }),
  })
  if (!r.ok) throw new Error(`GitHub GraphQL ${r.status}: ${await r.text()}`)
  const json = await r.json()
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join('; '))
  return json.data.viewer
}

function buildHeatmap(calendar) {
  const level = (c) => (c === 0 ? 0 : c < 3 ? 1 : c < 6 ? 2 : c < 10 ? 3 : 4)
  // Firestore NO permite arrays directamente anidados. Cada semana va envuelta en
  // un objeto { days: [...] } (array de objetos sí está permitido).
  const weeks = calendar.weeks.map((w) => ({
    days: w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: level(d.contributionCount),
    })),
  }))
  return { weeks, total: calendar.totalContributions }
}

function byMonth(calendar) {
  const map = new Map()
  for (const w of calendar.weeks) {
    for (const d of w.contributionDays) {
      const month = d.date.slice(0, 7)
      map.set(month, (map.get(month) || 0) + d.contributionCount)
    }
  }
  return [...map.entries()].sort().map(([month, contributions]) => ({ month, contributions }))
}

export function aggregate(viewer, opts = {}) {
  const publicOrgsSet = opts.publicOrgs ?? publicOrgs
  const c = viewer.contributionsCollection
  const me = viewer.login

  // PRs por repo (para cruzar con commits)
  const prByRepo = new Map()
  for (const item of c.pullRequestContributionsByRepository) {
    const key = `${item.repository.owner.login}/${item.repository.name}`
    prByRepo.set(key, item.contributions.totalCount)
  }

  // Anonimización estable de repos privados y orgs
  let privateCounter = 0
  let orgCounter = 0
  const orgAnonMap = new Map()
  const anonOrg = (login) => {
    if (login === me) return 'Personal'
    if (publicOrgsSet.has(login)) return login
    if (!orgAnonMap.has(login)) orgAnonMap.set(login, `Organización #${++orgCounter}`)
    return orgAnonMap.get(login)
  }

  const repositories = []
  const orgCommits = new Map()
  const langSize = new Map()

  for (const item of c.commitContributionsByRepository) {
    const repo = item.repository
    const commits = item.contributions.totalCount
    const key = `${repo.owner.login}/${repo.name}`

    repositories.push({
      name: repo.isPrivate ? `Proyecto privado #${++privateCounter}` : repo.name,
      private: repo.isPrivate,
      commits,
      prs: prByRepo.get(key) || 0,
    })

    const org = anonOrg(repo.owner.login)
    orgCommits.set(org, (orgCommits.get(org) || 0) + commits)

    for (const edge of repo.languages?.edges ?? []) {
      const prev = langSize.get(edge.node.name) ?? { language: edge.node.name, color: edge.node.color, size: 0 }
      prev.size += edge.size
      langSize.set(edge.node.name, prev)
    }
  }

  const langAll = [...langSize.values()].sort((a, b) => b.size - a.size)
  const langSum = langAll.reduce((s, l) => s + l.size, 0) || 1
  const languages = langAll.slice(0, 6).map((l) => ({
    language: l.language,
    color: l.color || '#888',
    percentage: Math.round((l.size / langSum) * 100),
  }))

  const organizations = [...orgCommits.entries()]
    .map(([name, commits]) => ({ name, commits }))
    .sort((a, b) => b.commits - a.commits)

  repositories.sort((a, b) => b.commits - a.commits)

  return {
    generatedAt: new Date().toISOString(),
    sample: false,
    user: { login: me },
    summary: {
      commits: c.totalCommitContributions,
      prs: c.totalPullRequestContributions,
      reviews: c.totalPullRequestReviewContributions,
      issues: c.totalIssueContributions,
      repositories: repositories.length,
      organizations: organizations.length,
      languages: langAll.length,
    },
    languages,
    organizations,
    repositories,
    heatmap: buildHeatmap(c.contributionCalendar),
    contributionsByMonth: byMonth(c.contributionCalendar),
  }
}

async function main() {
  if (!token) {
    console.error('Falta GH_METRICS_TOKEN')
    process.exit(1)
  }
  console.log('Recolectando métricas de GitHub…')
  const viewer = await fetchGitHub()
  const metrics = aggregate(viewer)
  console.log(`Usuario: ${metrics.user.login} | commits: ${metrics.summary.commits} | repos: ${metrics.summary.repositories}`)
  await saveMetrics(metrics)
  console.log('✅ Métricas guardadas en Firestore (metrics/latest + history).')
}

// Solo ejecuta el pipeline cuando se corre directo (no al importarlo en tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error('❌ Error:', e.message)
    process.exit(1)
  })
}
