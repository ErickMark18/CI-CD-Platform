FROM python:3.12-slim AS builder

WORKDIR /build
COPY pyproject.toml .
RUN python -m venv /venv
ENV PATH=/venv/bin:$PATH
RUN /venv/bin/pip install --no-deps -e .
COPY . .

FROM python:3.12-slim AS production

WORKDIR /app
ENV PATH=/app/venv/bin:$PATH
COPY --from=builder /venv /app/venv
COPY --from=builder /build/app /app/app
COPY --from=builder /build/tests /app/tests
COPY --from=builder /build/pyproject.toml /app/pyproject.toml
RUN /app/venv/bin/pip install pytest httpx
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
