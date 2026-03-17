from __future__ import annotations

import fitz  # PyMuPDF

from schemas import ExtractedBlock, HeadingBlock, TextBlock

H1_FONT_SIZE = 18.0
H2_FONT_SIZE = 14.0
H3_FONT_SIZE = 12.0


def _heading_level(font_size: float) -> int | None:
    if font_size >= H1_FONT_SIZE:
        return 1
    if font_size >= H2_FONT_SIZE:
        return 2
    if font_size >= H3_FONT_SIZE:
        return 3
    return None


def extract_page(pdf_bytes: bytes, page_index: int) -> tuple[int, list[ExtractedBlock]]:
    """Extract text blocks from a single PDF page.

    Returns ``(page_count, blocks)`` where each block is either a
    ``HeadingBlock`` or ``TextBlock`` in reading order.
    """

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page_count = len(doc)

    if page_index < 0 or page_index >= page_count:
        doc.close()
        return page_count, []

    page = doc.load_page(page_index)
    raw_blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]

    blocks: list[ExtractedBlock] = []

    for raw_block in raw_blocks:
        if raw_block.get("type") != 0:
            continue

        for line in raw_block.get("lines", []):
            line_text_parts: list[str] = []
            max_font_size = 0.0

            for span in line.get("spans", []):
                span_text = span.get("text", "").strip()
                if not span_text:
                    continue
                line_text_parts.append(span_text)
                font_size = span.get("size", 0.0)
                if font_size > max_font_size:
                    max_font_size = font_size

            full_text = " ".join(line_text_parts).strip()
            if not full_text:
                continue

            level = _heading_level(max_font_size)
            if level is not None:
                blocks.append(HeadingBlock(level=level, text=full_text))
            else:
                blocks.append(TextBlock(text=full_text))

    doc.close()

    # Merge consecutive TextBlocks into paragraphs
    merged: list[ExtractedBlock] = []
    for block in blocks:
        if (
            isinstance(block, TextBlock)
            and merged
            and isinstance(merged[-1], TextBlock)
        ):
            merged[-1] = TextBlock(text=merged[-1].text + " " + block.text)
        else:
            merged.append(block)

    return page_count, merged
