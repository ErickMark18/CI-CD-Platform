# CO2 Tracker Template

Este repositorio es una plantilla para trackear la huella de carbono de tus GitHub Actions.

## Setup

### 1. Usa este template

Cuando crees un nuevo repo, selecciona **"Use this template"** y elige `co2-tracker-template` como base.

### 2. Añade los secrets

En tu nuevo repo, ve a **Settings → Secrets and variables → Actions → New secret**:

| Secret | Valor |
|--------|-------|
| `CO2_API_URL` | URL de tu API CO2 Tracker (ej: `https://co2-tracker.up.railway.app`) |
| `CO2_API_KEY` | Tu API key |

### 3. Listo

Cada vez que hagas push y un workflow termine, el CO2 se enviará automáticamente a tu dashboard.

## Archivo

- `.github/workflows/co2-tracker.yml` - Workflow que envía datos de CO2

## Recursos

- [CO2 Tracker API](https://github.com/ErickMark18/co2-Tracker)
- [Dashboard](https://co2-tracker.up.railway.app/dashboard)