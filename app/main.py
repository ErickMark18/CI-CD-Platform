from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

ITEMS: list[dict] = []


class Item(BaseModel):
    name: str
    description: str | None = None


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/items")
def get_items():
    return ITEMS


@app.post("/items", status_code=201)
def create_item(item: Item):
    ITEMS.append(item.model_dump())
    return ITEMS[-1]
