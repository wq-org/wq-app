from __future__ import annotations

"""
Generate SQL seed files from CSV exports.

Usage:
  python scripts/generate_seed_from_csv.py path/to/file.csv
  python scripts/generate_seed_from_csv.py path/to/file.csv public.my_table

Relative paths are resolved against the current directory first, then against the
repository root (parent of ``scripts/``). So you can run from ``scripts/`` with
``python generate_seed_from_csv.py src/assets/data/foo.csv`` and still find
``src/`` at the repo root.

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
import sys
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# Repo root = parent of this file's directory (…/scripts/generate_seed_from_csv.py → …/)
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def resolve_user_csv_path(user_path: str) -> str:
    """
    Resolve a CLI path to an existing CSV file.

    Order: absolute path as given → path relative to cwd → path relative to REPO_ROOT.
    """
    user_path = user_path.strip()
    if not user_path:
        raise FileNotFoundError("Empty CSV path")

    if os.path.isabs(user_path):
        p = os.path.normpath(user_path)
        if os.path.isfile(p):
            return p
        raise FileNotFoundError(f"CSV not found: {p}")

    from_cwd = os.path.abspath(os.path.normpath(user_path))
    if os.path.isfile(from_cwd):
        return from_cwd

    from_repo = os.path.abspath(os.path.normpath(os.path.join(REPO_ROOT, user_path)))
    if os.path.isfile(from_repo):
        return from_repo

    raise FileNotFoundError(
        "CSV not found. Tried:\n"
        f"  (current directory) {from_cwd}\n"
        f"  (repository root)   {from_repo}"
    )


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
    csv_path: str,
    output_sql_path: Optional[str] = None,
    table_name: Optional[str] = None,
    batch_size: int = 500,
) -> str:
    """
    csv_path: Path to the .csv file (use ``resolve_user_csv_path`` from the CLI, or any
        absolute / cwd-relative path that exists).
    output_sql_path: If omitted, writes ``{same_dir}/{stem}_seed.sql`` next to the CSV.
    table_name: If omitted, uses ``public.{stem}`` where stem is the CSV basename without extension.
    """
    csv_path = os.path.abspath(os.path.normpath(csv_path))
    if not os.path.isfile(csv_path):
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    stem = os.path.splitext(os.path.basename(csv_path))[0]

    if output_sql_path is None:
        out_dir = os.path.dirname(csv_path)
        output_sql_path = os.path.join(out_dir, f"{stem}_seed.sql")
    else:
        output_sql_path = os.path.abspath(os.path.normpath(output_sql_path))

    if table_name is None:
        table_name = f"public.{stem}"

    out_path = output_sql_path

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
    """Legacy helper: expects ``csv/{csv_filename}.csv`` under the repo root."""
    legacy_csv = os.path.join(REPO_ROOT, "csv", f"{csv_filename}.csv")
    out = os.path.join(REPO_ROOT, "csv", f"seed_{csv_filename}.sql")
    generate_seed_sql_from_csv(
        csv_path=legacy_csv,
        output_sql_path=out,
        table_name=csv_filename,
    )


def main() -> None:
    if len(sys.argv) < 2:
        print("Please add a path to your CSV file.")
        print(
            "Example: python scripts/generate_seed_from_csv.py src/assets/data/feature_definitions.csv\n"
            "   or from scripts/: python generate_seed_from_csv.py src/assets/data/feature_definitions.csv"
        )
        sys.exit(1)

    csv_arg = sys.argv[1].strip()
    if not csv_arg:
        print("Please add a path to your CSV file.")
        print(
            "Example: python scripts/generate_seed_from_csv.py src/assets/data/feature_definitions.csv\n"
            "   or from scripts/: python generate_seed_from_csv.py src/assets/data/feature_definitions.csv"
        )
        sys.exit(1)

    table_override = sys.argv[2].strip() if len(sys.argv) > 2 and sys.argv[2].strip() else None

    try:
        csv_path = resolve_user_csv_path(csv_arg)
        generate_seed_sql_from_csv(
            csv_path=csv_path,
            table_name=table_override,
        )
    except (FileNotFoundError, ValueError) as e:
        print(e, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()