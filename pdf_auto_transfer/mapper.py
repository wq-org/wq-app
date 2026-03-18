from __future__ import annotations

from uuid import uuid4

from schemas import ExtractedBlock, HeadingBlock, ImageBlock, TextBlock

HEADING_LEVEL_TO_YOOPTA_TYPE = {
    1: "HeadingOne",
    2: "HeadingTwo",
    3: "HeadingThree",
}

HEADING_LEVEL_TO_ELEMENT_TYPE = {
    1: "heading-one",
    2: "heading-two",
    3: "heading-three",
}


def _make_yoopta_block(
    block_type: str,
    element_type: str,
    text: str,
    order: int,
) -> dict:
    block_id = str(uuid4())
    element_id = str(uuid4())

    return {
        "id": block_id,
        "type": block_type,
        "value": [
            {
                "id": element_id,
                "type": element_type,
                "children": [{"text": text}],
                "props": {
                    "nodeType": "block",
                },
            }
        ],
        "meta": {
            "order": order,
            "depth": 0,
            "align": "left",
        },
    }


def to_yoopta_blocks(blocks: list[ExtractedBlock]) -> list[dict]:
    """Convert extracted blocks to Yoopta-compatible JSON dicts."""

    result: list[dict] = []

    for index, block in enumerate(blocks):
        if isinstance(block, HeadingBlock):
            yoopta_type = HEADING_LEVEL_TO_YOOPTA_TYPE.get(block.level, "HeadingThree")
            element_type = HEADING_LEVEL_TO_ELEMENT_TYPE.get(block.level, "heading-three")
            result.append(_make_yoopta_block(yoopta_type, element_type, block.text, index))

        elif isinstance(block, TextBlock):
            result.append(_make_yoopta_block("Paragraph", "paragraph", block.text, index))

        elif isinstance(block, ImageBlock):
            d = _make_yoopta_block("Image", "paragraph", block.text, index)
            if block.thumbnail_data_url is not None:
                d["thumbnailDataUrl"] = block.thumbnail_data_url
            result.append(d)

    return result
