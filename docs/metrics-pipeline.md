# Pipeline de métricas de GitHub

La GitHub Action `metrics.yml` corre 1 vez al día, lee GitHub (incluyendo repos
privados/de organizaciones), anonimiza lo privado y guarda un snapshot en
**Firestore** (`metrics/latest`). El sitio lee de Firestore en runtime — **nunca**
toca la API de GitHub ni expone tokens.

```
Action (cron) → GitHub GraphQL → anonimiza → Firestore(metrics/latest) → /api/metrics → dashboard + chatbot
```

## Principio de privacidad

- Los repos privados se renombran a `Proyecto privado #N`.
- Las organizaciones se anonimizan a `Organización #N`, salvo las que listes en
  `GH_PUBLIC_ORGS` (variable del repo).
- Solo se publican **agregados** (conteos, %), nunca contenido ni nombres internos.
- Los datos viven en Firestore (privado), no en una URL pública.

> ⚠️ Revisá la política de tu empleador antes de publicar métricas derivadas de
> repos de la empresa, aunque estén anonimizadas.

---

## Setup (una sola vez)

### 1. Token de GitHub (PAT)

Creá un **PAT clásico** en https://github.com/settings/tokens con scopes:
`repo`, `read:org`, `read:user`. Este token vive SOLO como secret de la Action.

### 2. GCP: service account + Workload Identity (sin llaves)

```bash
export PROJECT_ID=tu-proyecto
export REPO="tu-usuario/portfolio"     # owner/repo de GitHub
export SA_NAME=github-metrics
export POOL=github-pool
export PROVIDER=github-provider

gcloud config set project $PROJECT_ID
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# Service account con permiso de escribir en Firestore
gcloud iam service-accounts create $SA_NAME --display-name="GitHub Metrics"
export SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" --role="roles/datastore.user"

# Pool + provider OIDC de GitHub
gcloud iam workload-identity-pools create $POOL --location=global --display-name="GitHub"
gcloud iam workload-identity-pools providers create-oidc $PROVIDER \
  --location=global --workload-identity-pool=$POOL \
  --display-name="GitHub provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='$REPO'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Permitir que SOLO tu repo impersonate el service account
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository/$REPO"

# Imprime el valor para el secret GCP_WIF_PROVIDER:
echo "projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/providers/$PROVIDER"
echo "SA: $SA_EMAIL"
```

> El `attribute-condition` restringe el acceso a tu repo: sin él, cualquier repo
> de GitHub podría impersonar el service account.

### 3. Secrets y variables en el repo de GitHub

En **Settings → Secrets and variables → Actions**:

**Secrets:**
| Nombre | Valor |
|---|---|
| `GH_METRICS_TOKEN` | el PAT del paso 1 |
| `GCP_WIF_PROVIDER` | lo que imprimió el `echo` (projects/…/providers/…) |
| `GCP_SERVICE_ACCOUNT` | `github-metrics@tu-proyecto.iam.gserviceaccount.com` |
| `GCP_PROJECT_ID` | tu-proyecto |

**Variables (opcional):**
| Nombre | Valor |
|---|---|
| `GH_PUBLIC_ORGS` | logins de orgs a mostrar con nombre real (coma-separados) |

### 4. Firestore

La base debe existir en modo nativo (ver README, sección deploy):
```bash
gcloud firestore databases create --location=us-central1
```

### 5. Probar

En la pestaña **Actions → GitHub Metrics → Run workflow** (gracias a
`workflow_dispatch`). Si todo está bien, vas a ver el doc `metrics/latest` en
Firestore y el dashboard dejará de mostrar el aviso de "datos de ejemplo".
