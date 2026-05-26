# AGENTS.md

## Proyecto: Mini Plataforma CI/CD

Stack: Python (FastAPI) · Docker · GitHub Actions · Nginx · TypeScript

## Estructura

```
app/                  # API FastAPI (main.py)
tests/                # pytest + httpx (test_api.py, test_rollback.py)
pyproject.toml        # setuptools + pytest config
Makefile              # make install, make test
docker-compose.yml    # dev con hot-reload
docker-compose.prod.yml  # prod (app + nginx)
Dockerfile            # multi-stage (builder → production)
nginx/nginx.conf       # reverse proxy
scripts/
  deploy.sh
  rollback.sh
dashboard/            # React + TypeScript + Vite
.github/workflows/
  ci.yml             # test + build ghcr.io (push a master/main, PR)
  cd.yml             # deploy SSH solo en push a main
  co2-tracker.yml    # emisiones CO2
  test.yml           # workflow legacy
```

## Comandos locales (Windows)

```bash
py -m pip install -e .           # instalar dependencias
py -m pip install pytest httpx    # dependencias de test
py -m pytest -v                   # ejecutar tests
py -m uvicorn app.main:app --reload  # arrancar API
```

## Reglas de seguridad

- **Nunca** committed: SSH keys, tokens, `.env`, IPs → van a **GitHub Secrets**
- `.gitignore` excluye: `*.env`, `*.log`, `__pycache__/`, `.pytest_cache/`, `*.db`

## Tests

- `tests/test_api.py` — 7 tests unitarios de la API ( asyncio + httpx)
- `tests/test_rollback.py` — tests de integración (requieren Docker corriendo)
- Rollback tests se saltan si no hay contenedor

## Workflows

- **ci.yml**: se dispara en push a `master`/`main` y PRs. Jobs: test → build → push ghcr.io
- **cd.yml**: solo en push a `main`. Deploy SSH + healthcheck + rollback automático
- **co2-tracker.yml**: escucha `workflow_run` de CI/CD para trackear emisiones
- **test.yml**: workflow legacy, no usar

## Notas de implementación

- **Healthcheck**: `GET /health` → `{status: "ok", "version": "1.0.0"}`
- **Versiones imágenes**: tag con `sha-xxxxxx` + nombre de rama, nunca `latest`
- **Rollback**: guarda imagen previa en `/tmp/previous_image` en el servidor antes de deploy
- **Dockerignore**: excluye `.git`, `tests/`, `__pycache__/`, archivos de desarrollo
- **pyproject.toml**: usa `packages.find.include = ["app*"]` para evitar conflictos con `nginx/` y `dashboard/`
