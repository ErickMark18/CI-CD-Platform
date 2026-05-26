import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"


@pytest.mark.asyncio
async def test_health_fields():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    data = response.json()
    assert "status" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_get_items_empty():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/items")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_get_items_after_create():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post("/items", json={"name": "item1"})
        response = await client.get("/items")
    assert response.status_code == 200
    assert len(response.json()) == 1


@pytest.mark.asyncio
async def test_post_items_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/items", json={"name": "item1", "description": "test"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "item1"
    assert data["description"] == "test"


@pytest.mark.asyncio
async def test_post_items_without_description():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/items", json={"name": "item1"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "item1"
    assert data["description"] is None


@pytest.mark.asyncio
async def test_post_items_missing_name():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/items", json={"description": "test"})
    assert response.status_code == 422
