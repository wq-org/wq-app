from __future__ import annotations

"""
recover.py

Generate SQL seed files from CSV exports.

This version:
- Uses Python's csv reader (handles commas/quotes correctly)
- Produces valid SQL literals (escapes strings)
- Converts common types (UUID, bool, timestamptz) safely
- Writes deterministic INSERT statements for the target table
"""

import csv
import json
import os
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple


UUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)
# Accept common timestamp formats from Supabase exports, e.g.
# - 2025-11-01T16:30:56.497322Z
# - 2026-02-12 14:00:13.838597+00
ISO_TS_PREFIX_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}"
)

# -----------------------------------------------------------------------------
# Non-null safety defaults
# -----------------------------------------------------------------------------
# If a CSV cell is empty/NULL for these columns, we emit a safe SQL literal
# instead of NULL. This prevents NOT NULL constraint failures during seeding.
#
# Key: (table_name, column_name) -> SQL literal string
NON_NULL_DEFAULTS: Dict[Tuple[str, str], str] = {
    # profiles
    ("public.profiles", "linkedin_url"): "''",

    # lessons
    # Your schema enforces lessons.content NOT NULL, but some exports contain NULL.
    # Use empty JSON object as safe default.
    ("public.lessons", "content"): "'{}'::jsonb",
}

# If you want a global default for any column named 'content' across tables,
# you can add: ("*", "content"): "''"

# -----------------------------------------------------------------------------
# JSON/JSONB columns
# -----------------------------------------------------------------------------
# If a column is json/jsonb, we must emit valid JSON.
# - If the CSV value is already valid JSON, we keep it.
# - If it's plain text, we JSON-encode it (so it becomes a JSON string).
# - If it's empty/NULL, we emit '{}'::jsonb by default.
JSON_COLUMNS: Dict[Tuple[str, str], str] = {
    # lessons
    # Adjust this mapping to match your actual schema. Most WQ lesson designs use
    # a json/jsonb `content` field.
    ("public.lessons", "content"): "jsonb",
}

JSON_EMPTY_DEFAULT: Dict[str, str] = {
    "json": "'{}'::json",
    "jsonb": "'{}'::jsonb",
}


def _sql_escape_string(value: str) -> str:
    return value.replace("'", "''")


def _is_uuid(value: str) -> bool:
    return bool(UUID_RE.match(value))


def _is_iso_timestamp(value: str) -> bool:
    return bool(ISO_TS_PREFIX_RE.match(value))


def _to_sql_literal(raw: Optional[str], *, table_name: str, column_name: str) -> str:
    # Table-specific non-null safety default
    table_key = (table_name, column_name)
    wildcard_key = ("*", column_name)
    non_null_default = NON_NULL_DEFAULTS.get(table_key) or NON_NULL_DEFAULTS.get(wildcard_key)

    # JSON handling (table/column specific)
    json_kind = JSON_COLUMNS.get(table_key) or JSON_COLUMNS.get(wildcard_key)

    if raw is None:
        if json_kind:
            return JSON_EMPTY_DEFAULT[json_kind]
        return non_null_default if non_null_default is not None else "NULL"

    value = raw.strip()

    # Empty -> NULL unless overridden
    if value == "":
        if json_kind:
            return JSON_EMPTY_DEFAULT[json_kind]
        return non_null_default if non_null_default is not None else "NULL"

    # Canonical NULL spellings
    if value.upper() in {"NULL", "\\N"}:
        if json_kind:
            return JSON_EMPTY_DEFAULT[json_kind]
        return non_null_default if non_null_default is not None else "NULL"

    # JSON / JSONB columns: ensure valid JSON
    if json_kind:
        try:
            # If value is already JSON (object/array/string/number/etc.)
            parsed = json.loads(value)
            normalized = json.dumps(parsed, ensure_ascii=False)
        except Exception:
            # Treat as plain text and encode into a JSON string
            normalized = json.dumps(value, ensure_ascii=False)

        return f"'{_sql_escape_string(normalized)}'::{json_kind}"

    # Booleans
    if value.lower() in {"true", "false"}:
        return value.lower()

    # UUIDs
    if _is_uuid(value):
        return f"'{_sql_escape_string(value)}'::uuid"

    # Timestamps
    if _is_iso_timestamp(value):
        return f"'{_sql_escape_string(value)}'::timestamptz"

    # Integers
    if re.fullmatch(r"-?\d+", value):
        return value

    # Default: string
    return f"'{_sql_escape_string(value)}'"


def generate_seed_sql_from_csv(
    *,
    csv_filename: str,
    output_sql_filename: Optional[str] = None,
    table_name: Optional[str] = None,
    batch_size: int = 500,
) -> str:
    if output_sql_filename is None:
        output_sql_filename = f"seed_{csv_filename}.sql"

    if table_name is None:
        table_name = csv_filename

    csv_path = os.path.join("csv", f"{csv_filename}.csv")
    out_path = os.path.join("csv", output_sql_filename)

    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    print(f"Creating SQL seed from {csv_path} -> {out_path}")

    with open(csv_path, "r", encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        if not header:
            raise ValueError("CSV has no header row")

        columns = [col.strip() for col in header if col and col.strip()]
        if not columns:
            raise ValueError("Header row contains no columns")

        rows: List[List[str]] = []
        for row in reader:
            padded = (row + [""] * len(columns))[: len(columns)]
            rows.append(padded)

    now = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    sql_lines: List[str] = []
    sql_lines.append("-- Auto-generated seed file")
    sql_lines.append(f"-- Source: {csv_path}")
    sql_lines.append(f"-- Generated: {now}")
    sql_lines.append("BEGIN;")

    col_list = ", ".join(columns)

    def emit_insert(batch: List[List[str]]) -> None:
        sql_lines.append(f"INSERT INTO {table_name} ({col_list}) VALUES")
        value_lines: List[str] = []
        for r in batch:
            literals = [
                _to_sql_literal(cell, table_name=table_name, column_name=columns[i])
                for i, cell in enumerate(r)
            ]
            value_lines.append(f"  ({', '.join(literals)})")
        sql_lines.append(",\n".join(value_lines) + ";")

    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        if batch:
            emit_insert(batch)

    sql_lines.append("COMMIT;")
    sql_lines.append("")

    with open(out_path, "w", encoding="utf-8", newline="") as out:
        out.write("\n".join(sql_lines))

    print(f"Finished writing {out_path} ✅")
    return out_path


def generate_recovery_data_by_csv(csv_filename: str) -> None:
    generate_seed_sql_from_csv(
        csv_filename=csv_filename,
        output_sql_filename=f"seed_{csv_filename}.sql",
        table_name=csv_filename,
    )


# Example usage
# generate_recovery_data_by_csv("public.courses")
# generate_recovery_data_by_csv("public.games")
# generate_recovery_data_by_csv("public.institutions")
generate_recovery_data_by_csv("public.lessons")
# generate_recovery_data_by_csv("public.profiles")
# generate_recovery_data_by_csv("public.teacher_followers")
# generate_recovery_data_by_csv("public.topics")
# generate_recovery_data_by_csv("public.user_institutions")