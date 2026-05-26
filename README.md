# CI-CD-Platform

[![CI](https://github.com/YOUR_GITHUB_USERNAME/CI-CD-Platform/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_GITHUB_USERNAME/CI-CD-Platform/actions/workflows/ci.yml) · [![CD](https://github.com/YOUR_GITHUB_USERNAME/CI-CD-Platform/actions/workflows/cd.yml/badge.svg?branch=main)](https://github.com/YOUR_GITHUB_USERNAME/CI-CD-Platform/actions/workflows/cd.yml)

Automatización del ciclo completo de software: desde un push a Git hasta el despliegue en un servidor real.

## Arquitectura

```
┌───────────┐     ┌───────────────┐     ┌───────────┐     ┌─────────────┐
│    Git    │────▶│  GitHub       │────▶│  ghcr.io  │────▶│  Server     │
│   Push    │     │  Actions      │     │  Image    │     │  SSH+Nginx  │
│           │     │  CI/CD        │     │           │     │  Deploy     │
└───────────┘     └───────────────┘     └───────────┘     └─────────────┘
                                                                 │
                                                ┌────────────────┘
                                                ▼
                                          ┌───────────┐
                                          │Healthcheck│
                                          │   +30s    │
                                                │
                                 ┌──────────────┴──────────────┐
                                 ▼                              ▼
                          [/health OK]                   [/health FAIL]
                          Deploy completo                 Rollback automático
                                                       (imagen previa)
```

## Stack

| Componente | Tecnología |
|------------|------------|
| API | Python 3.12 + FastAPI |
| Tests | pytest + httpx |
| Contenedores | Docker multi-stage |
| Registry | GitHub Container Registry (ghcr.io) |
| CI/CD | GitHub Actions |
| Proxy | Nginx |
| Dashboard | TypeScript + React |

## Fases de desarrollo

| Fase | Estado | Descripción |
|------|--------|-------------|
| 1 | ✅ | API FastAPI (3 endpoints) + tests 100% |
| 2 | ✅ | Docker multi-stage + docker-compose |
| 3 | ✅ | CI/CD workflows separados |
| 4 | ✅ | Deploy SSH + Nginx reverse proxy |
| 5 | ✅ | Rollback automático con healthcheck |
| 6 | ✅ | Dashboard TypeScript |

## Inicio rápido

```bash
# Instalar dependencias
make install

# Ejecutar tests
make test
```

### Docker

```bash
# Desarrollo con hot-reload
docker compose up app

# Producción
docker compose -f docker-compose.prod.yml up -d
```

## Secrets requeridos (GitHub Settings → Secrets)

| Secret | Descripción |
|--------|-------------|
| `DEPLOY_SSH_KEY` | Clave SSH privada para acceder al servidor |
| `DEPLOY_HOST` | IP o dominio del servidor |
| `DEPLOY_USER` | Usuario SSH |

## Pipeline flow

### CI (cada push/PR)
1. Checkout + setup Python 3.12
2. `pip install -e ".[test]"`
3. `pytest -v`
4. Build imagen Docker
5. Push a ghcr.io (`sha-xxxxx` + tag de rama)

### CD (solo push a main)
1. Checkout + extract hash
2. SSH al servidor
3. `docker pull ghcr.io/...`
4. `docker compose up -d`
5. Healthcheck (espera 15s, curl /health)
6. Si falla → rollback a imagen anterior

## Rollback

**Automático**: si el healthcheck falla tras 15s, el pipeline restaura la imagen anterior.

**Manual**:
```bash
./rollback.sh sha-abc1234
```

## Lecciones aprendidas

- **Docker multi-stage**: reduce la imagen final de ~800MB a ~80MB usando `python:3.12-slim` y copiando solo el venv + código.
- **Dockerignore correcto**: excluir `tests/`, `.git/`, `__pycache__/` y archivos de desarrollo mantiene la imagen limpia.
- **Separación CI/CD**: `ci.yml` corre en todo push/PR (tests rápidos); `cd.yml` solo en `main` (deploy lento). Esto evita deploys de ramas defectuosas.
- **HEALTHCHECK en Dockerfile**: Docker reinicia automaticamente si la app deja de responder, sin depender del pipeline.
- **GitHub Secrets**: nunca commits de credenciales. SSH keys van a Secrets, no al repositorio.
- **ghcr.io cache**: usar `cache-from: type=gha` reduce el build de CI/CD de ~3-4min a ~30s.

## Dashboard

El dashboard en `dashboard/` muestra el historial de deploys. Para correrlo:

```bash
cd dashboard
npm install
npm run dev
```

> Los datos de ejemplo sirven como mock. Para conectar con GitHub Actions API, configurar `GITHUB_TOKEN` y consultar `/runs` endpoint.
