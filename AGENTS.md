# AGENTS.md

## Proyecto: Mini Plataforma CI/CD (6 fases)

Stack: Python (FastAPI) · Docker · GitHub Actions · Nginx · TypeScript

## Estructura del proyecto

```
app/          # Código de la API FastAPI
tests/        # Tests pytest + httpx
Makefile      # scripts: make test, make build, etc.
.github/workflows/
  ci.yml      # Tests en cada push/PR
  cd.yml      # Deploy solo en push a main
Dockerfile    # Multi-stage build
docker-compose.yml
```

## Reglas de seguridad (NO violar)

- **Nunca** committed: SSH keys privadas, tokens, `.env`, IPs de servidor
- Van a **GitHub Secrets**: `DEPLOY_SSH_KEY`, `DEPLOY_HOST`, tokens ghcr.io
- `.gitignore` ya incluye `*.env`, `*.log`, `__pycache__/`, `.pytest_cache/`

## Comandos esenciales (una vez exista el código)

```bash
make test        # Ejecutar tests localmente
docker build -t mi-app .          # Construir imagen
docker run --rm mi-app pytest     # Tests dentro del contenedor
```

## Desarrollo por fases

| Fase | Entregable |
|------|------------|
| 1 | API FastAPI (3 endpoints + tests al 100%) |
| 2 | Dockerfile multi-stage + docker-compose + .dockerignore |
| 3 | ci.yml + cd.yml con ghcr.io y caché Docker |
| 4 | Deploy SSH + Nginx reverse proxy |
| 5 | Rollback automático con healthcheck |
| 6 | Dashboard TypeScript + README.md |

## Notas de implementación

- **Docker**: imagen base `python:3.12-slim`, multi-stage para producción
- **Versiones**: usar tags semánticos (`v1.0.0`) + hash commit (`sha-abc1234`), nunca solo `latest`
- **Healthcheck**: `GET /health` devuelve `{status: ok, version: 1.0.0}` — el pipeline lo usa para verificar deploy
- **Rollback (Fase 5)**: guardar `PREVIOUS_IMAGE` antes del deploy; si healthcheck falla tras 15s, rollback a imagen anterior
- **CI/CD separado**: `ci.yml` en todo push/PR; `cd.yml` solo en push a `main`