from __future__ import annotations

from typing import Literal, Union

from pydantic import BaseModel, Field


class HeadingBlock(BaseModel):
    type: Literal["heading"] = "heading"
    level: int = Field(ge=1, le=3)
    text: str


class TextBlock(BaseModel):
    type: Literal["text"] = "text"
    text: str


ExtractedBlock = Union[HeadingBlock, TextBlock]


class ExtractRequest(BaseModel):
    storage_url: str
    page: int = Field(ge=0)


class ExtractResponse(BaseModel):
    page_count: int
    blocks: list[dict]
