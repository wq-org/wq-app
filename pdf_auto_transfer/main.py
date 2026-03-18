from __future__ import annotations

import certifi
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from extractor import extract_page
from mapper import to_yoopta_blocks
from schemas import ExtractRequest, ExtractResponse

app = FastAPI(title="WQ PDF Worker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/extract", response_model=ExtractResponse)
async def extract(req: ExtractRequest) -> ExtractResponse:
    async with httpx.AsyncClient(timeout=15.0, verify=certifi.where()) as client:
        resp = await client.get(req.storage_url)

    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to download PDF (status {resp.status_code})",
        )

    pdf_bytes = resp.content
    page_count, blocks = extract_page(pdf_bytes, req.page)
    yoopta_blocks = to_yoopta_blocks(blocks)

    response = ExtractResponse(page_count=page_count, blocks=yoopta_blocks)
    print("Extract response:", response.model_dump())
    return response
