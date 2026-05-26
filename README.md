# CI-CD-Platform

[![CI](https://github.com/YOUR_GITHUB_USERNAME/CI-CD-Platform/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_GITHUB_USERNAME/CI-CD-Platform/actions/workflows/ci.yml) · [![CD](https://github.com/YOUR_GITHUB_USERNAME/CI-CD-Platform/actions/workflows/cd.yml/badge.svg?branch=main)](https://github.com/YOUR_GITHUB_USERNAME/CI-CD-Platform/actions/workflows/cd.yml)

Plataforma CI/CD que automatiza el ciclo completo: push → tests → build Docker → deploy → rollback automático.

## Arquitectura

```
Git Push → GitHub Actions CI → ghcr.io Image → Server (SSH+Nginx)
                                          │
                                   Healthcheck +30s
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
                  Deploy completo                    Rollback automático
```

## Requisitos

- Python 3.12+
- Docker (para producción)
- GitHub Actions (para CI/CD)

## Instalación local

```bash
# Clonar
git clone https://github.com/YOUR_GITHUB_USERNAME/CI-CD-Platform.git
cd CI-CD-Platform

# Instalar dependencias
make install

# Verificar que todo funciona
make test
```

## API (desarrollo local)

```bash
pip install -e .
uvicorn app.main:app --reload
```

Endpoints disponibles:
- `GET /health` — Healthcheck (`{"status": "ok", "version": "1.0.0"}`)
- `GET /items` — Lista de items
- `POST /items` — Crear item (`{"name": "...", "description": "..."}`)

## Docker

```bash
# Construir imagen
docker build -t ci-cd-platform .

# Tests dentro del contenedor
docker run --rm ci-cd-platform pytest

# Desarrollo con hot-reload
docker compose up app

# Producción
docker compose -f docker-compose.prod.yml up -d
```

## Deploy automático (Producción)

### 1. Secrets requeridos

En **GitHub Settings → Secrets and variables → Actions**, añade:

| Secret | Descripción |
|--------|-------------|
| `DEPLOY_SSH_KEY` | Clave SSH privada para acceder al servidor |
| `DEPLOY_HOST` | IP o dominio del servidor |
| `DEPLOY_USER` | Usuario SSH |

### 2. Preparar servidor

```bash
# En el servidor, clonar el repo
git clone https://github.com/YOUR_GITHUB_USERNAME/CI-CD-Platform.git /opt/ci-cd-platform
cd /opt/ci-cd-platform

# Asegúrate de tener Docker instalado
docker --version
```

### 3. Pipeline

Cada **push a `main`** ejecuta:
1. Tests (`pytest -v`)
2. Build imagen Docker → ghcr.io
3. Deploy por SSH al servidor
4. Healthcheck (`curl /health`)
5. Si el healthcheck falla → rollback automático

## Rollback manual

Si necesitas revertir a una versión anterior:

```bash
cd /opt/ci-cd-platform
./scripts/rollback.sh sha-abc1234
```

## Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Abre `http://localhost:5173` para ver el historial de deploys y tendencias de duración del pipeline.

## Uso en tu propio proyecto

Copia la estructura y adapta:

1. **API**: tu código en `app/`
2. **Tests**: añade en `tests/`
3. **Workflows**: ajusta `ci.yml` y `cd.yml` con tu registry y servidor
4. **Secrets**: configura `DEPLOY_SSH_KEY`, `DEPLOY_HOST`, `DEPLOY_USER`
5. **Dashboard**: conecta a [GitHub Actions API](https://docs.github.com/en/rest/actions) para datos reales

## Notas de seguridad

- **Nunca** guardes credenciales en el repositorio. Usa GitHub Secrets.
- Las claves SSH, tokens e IPs van siempre en `Settings → Secrets`.
- `.gitignore` ya excluye `.env`, `*.log`, y archivos de desarrollo.

## Stack

| Componente | Tecnología |
|------------|------------|
| API | Python 3.12 + FastAPI |
| Tests | pytest + httpx |
| Docker | Multi-stage build |
| Registry | GitHub Container Registry (ghcr.io) |
| CI/CD | GitHub Actions |
| Proxy | Nginx |
| Dashboard | TypeScript + React + Vite |
