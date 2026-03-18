from __future__ import annotations

import base64
import fitz  # PyMuPDF

from schemas import ExtractedBlock, HeadingBlock, ImageBlock, TextBlock

H1_FONT_SIZE = 18.0
H2_FONT_SIZE = 14.0
H3_FONT_SIZE = 12.0
THUMBNAIL_MAX_WIDTH = 200


def _heading_level(font_size: float) -> int | None:
    if font_size >= H1_FONT_SIZE:
        return 1
    if font_size >= H2_FONT_SIZE:
        return 2
    if font_size >= H3_FONT_SIZE:
        return 3
    return None


def _image_bbox(page: fitz.Page, image_item: tuple, xref: int) -> fitz.Rect | None:
    """Get bounding box for an image. Prefer get_image_bbox; fall back to get_image_rects."""
    if hasattr(page, "get_image_bbox"):
        try:
            return page.get_image_bbox(image_item)
        except Exception:
            pass
    if hasattr(page, "get_image_rects"):
        rects = page.get_image_rects(xref)
        if rects:
            return rects[0]
    return None


def _make_thumbnail(page: fitz.Page, rect: fitz.Rect) -> str | None:
    """Render the rect region to a PNG data URL, capped at THUMBNAIL_MAX_WIDTH."""
    try:
        scale = 1.0
        if rect.width > THUMBNAIL_MAX_WIDTH:
            scale = THUMBNAIL_MAX_WIDTH / rect.width
        mat = fitz.Matrix(scale, scale)
        pix = page.get_pixmap(clip=rect, matrix=mat, dpi=72, alpha=False)
        png_bytes = pix.tobytes("png")
        b64 = base64.b64encode(png_bytes).decode("ascii")
        return f"data:image/png;base64,{b64}"
    except Exception:
        return None


def extract_page(pdf_bytes: bytes, page_index: int) -> tuple[int, list[ExtractedBlock]]:
    """Extract text and image blocks from a single PDF page in reading order.

    Returns ``(page_count, blocks)`` where each block is a ``HeadingBlock``,
    ``TextBlock``, or ``ImageBlock`` in reading order (top-to-bottom, left-to-right).
    Images are detected via page.get_images() and get_image_bbox; optional
    thumbnails are attached to ImageBlocks.
    """

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page_count = len(doc)

    if page_index < 0 or page_index >= page_count:
        doc.close()
        return page_count, []

    page = doc.load_page(page_index)
    raw_blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]

    # 1. Collect text blocks with bbox (from get_text dict)
    text_entries: list[tuple[tuple[float, float, float, float], ExtractedBlock]] = []
    for raw_block in raw_blocks:
        if raw_block.get("type", 0) != 0:
            continue
        block_bbox = raw_block.get("bbox", (0, 0, 0, 0))
        x0, y0, x1, y1 = block_bbox

        for line in raw_block.get("lines", []):
            line_text_parts: list[str] = []
            max_font_size = 0.0
            line_bbox = line.get("bbox", block_bbox)
            lx0, ly0, lx1, ly1 = line_bbox

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
                text_entries.append((line_bbox, HeadingBlock(level=level, text=full_text)))
            else:
                text_entries.append((line_bbox, TextBlock(text=full_text)))

    # 2. Collect image (bbox, xref) via get_images and get_image_bbox / get_image_rects
    image_entries: list[tuple[fitz.Rect, int]] = []
    try:
        image_list = page.get_images(full=True)
    except Exception:
        image_list = []
    for image_item in image_list:
        xref = image_item[0] if isinstance(image_item, (list, tuple)) else image_item
        rect = _image_bbox(page, image_item, xref)
        if rect is not None and rect.is_empty is False:
            image_entries.append((rect, xref))

    # 3. Merge in reading order: sort by (y0, x0)
    ordered: list[tuple[str, object]] = []
    for bbox, block in text_entries:
        ordered.append(("text", (bbox, block)))
    for rect, xref in image_entries:
        ordered.append(("image", (rect, xref)))

    def _order_key(item: tuple) -> tuple[float, float]:
        kind, payload = item
        if kind == "text":
            bbox, _ = payload
            return (bbox[1], bbox[0])
        rect, _ = payload
        return (rect.y0, rect.x0)

    ordered.sort(key=_order_key)

    # 4. Build ordered list of ExtractedBlock; generate thumbnails for images
    blocks: list[ExtractedBlock] = []
    for kind, payload in ordered:
        if kind == "text":
            _, block = payload
            blocks.append(block)
        else:
            rect, _ = payload
            thumb = _make_thumbnail(page, rect)
            blocks.append(ImageBlock(thumbnail_data_url=thumb))

    doc.close()

    # 5. Merge consecutive TextBlocks into paragraphs
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
