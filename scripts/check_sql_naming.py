import re
import sys
from pathlib import Path

MIGRATIONS_DIR = Path("supabase/migrations")

TRIGGER_RE = re.compile(
    r"CREATE\s+TRIGGER\s+([a-zA-Z0-9_]+)",
    re.IGNORECASE,
)

INDEX_RE = re.compile(
    r"CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)",
    re.IGNORECASE,
)

FUNCTION_RE = re.compile(
    r"CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([a-zA-Z0-9_.]+)",
    re.IGNORECASE,
)

POLICY_RE = re.compile(
    r"CREATE\s+POLICY\s+(?:(\"[^\"]*\")|('[^']*')|([a-zA-Z0-9_]+))",
    re.IGNORECASE,
)

# Inline / ALTER TABLE named constraints (not DROP).
FK_CONSTRAINT_RE = re.compile(
    r"(?:ADD\s+CONSTRAINT|CONSTRAINT)\s+([a-zA-Z0-9_]+)\s+FOREIGN\s+KEY",
    re.IGNORECASE,
)

UQ_CONSTRAINT_RE = re.compile(
    r"(?:ADD\s+CONSTRAINT|CONSTRAINT)\s+([a-zA-Z0-9_]+)\s+UNIQUE\b",
    re.IGNORECASE,
)

CHK_CONSTRAINT_RE = re.compile(
    r"(?:ADD\s+CONSTRAINT|CONSTRAINT)\s+([a-zA-Z0-9_]+)\s+CHECK\b",
    re.IGNORECASE,
)

BAD_ABBREVIATIONS = {
    "ca",
    "coa",
    "ccl",
    "crs",
}

# Identifiers that contain a banned short prefix but are legacy DROP targets (prefer full names for new objects).
LEGACY_IDENTIFIER_EXCEPTIONS = frozenset(
    {
        "crs_updated_at",
        "crs_super_admin",
        "crs_institution_admin",
        "crs_teacher_manage",
        "crs_member_read",
        "ca_updated_at",
        "ca_super_admin",
        "ca_institution_admin_read",
        "ca_teacher_manage",
        "ca_member_read",
        "coa_updated_at",
        "coa_super_admin",
        "coa_institution_admin_read",
        "coa_teacher_manage",
        "coa_member_read",
    }
)

# Pre-chk_ CHECK constraint names from early baseline migrations (prefer chk_* for new work).
LEGACY_CHECK_CONSTRAINT_NAMES = frozenset(
    {
        "courses_theme_id_check",
        "games_theme_id_check",
    }
)

# Baseline migration (20260209000001) created triggers before trg_* convention; new triggers must use trg_*.
LEGACY_TRIGGER_NAMES = frozenset(
    {
        "profiles_updated_at",
        "institutions_updated_at",
        "courses_updated_at",
        "topics_updated_at",
        "lessons_updated_at",
        "games_updated_at",
        "teacher_followers_count",
        "on_auth_user_created",
    }
)


def line_at(text: str, pos: int) -> int:
    return text.count("\n", 0, pos) + 1


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    sys.exit(1)


def check_trigger_name(name: str, file: Path, line: int | None) -> None:
    loc = f"{file}:{line}" if line else str(file)
    if name in LEGACY_TRIGGER_NAMES:
        return
    if not name.startswith("trg_"):
        fail(f"{loc}: trigger '{name}' must start with 'trg_'")
    parts = name.split("_")
    # trg_<table>_<purpose…> — require at least three segments after `trg` (e.g. trg_tasks_set_updated_at).
    if len(parts) < 4:
        fail(f"{loc}: trigger '{name}' must be trg_<table>_<purpose> with purpose spanning at least one segment")


def check_index_name(name: str, file: Path, line: int | None) -> None:
    loc = f"{file}:{line}" if line else str(file)
    if not name.startswith("idx_"):
        fail(f"{loc}: index '{name}' must start with 'idx_'")


def check_function_name(name: str, file: Path, line: int | None) -> None:
    loc = f"{file}:{line}" if line else str(file)
    short = name.split(".")[-1]
    if short.startswith(("fn_", "do_", "tmp_")):
        fail(
            f"{loc}: function '{name}' should use business verb naming, "
            "e.g. create_institution_with_admin"
        )


def check_policy_name(raw_name: str, file: Path, line: int | None) -> None:
    loc = f"{file}:{line}" if line else str(file)
    name = raw_name.strip("\"'")
    # Baseline used quoted English descriptions; new policies should be snake_case table_action_role.
    if " " in name:
        return
    parts = name.split("_")
    if len(parts) < 3:
        fail(f"{loc}: policy '{name}' should follow <table>_<action>_<role> (see docs/architecture/db_naming_convention.md)")


def check_fk_constraint(name: str, file: Path, line: int | None) -> None:
    loc = f"{file}:{line}" if line else str(file)
    if not name.startswith("fk_"):
        fail(f"{loc}: foreign key constraint '{name}' must start with 'fk_' (see fk_{{from_table}}_{{to_table}})")


def check_uq_constraint(name: str, file: Path, line: int | None) -> None:
    loc = f"{file}:{line}" if line else str(file)
    if not name.startswith("uq_"):
        fail(f"{loc}: unique constraint '{name}' must start with 'uq_'")


def check_chk_constraint(name: str, file: Path, line: int | None) -> None:
    loc = f"{file}:{line}" if line else str(file)
    if name in LEGACY_CHECK_CONSTRAINT_NAMES:
        return
    if not name.startswith("chk_"):
        fail(f"{loc}: check constraint '{name}' must start with 'chk_' (legacy exceptions are allowlisted in script)")


def check_for_bad_abbreviations(text: str, file: Path) -> None:
    for bad in BAD_ABBREVIATIONS:
        for m in re.finditer(rf"\b({bad}_[a-z0-9_]+)\b", text, flags=re.IGNORECASE):
            ident = m.group(1).lower()
            if ident in LEGACY_IDENTIFIER_EXCEPTIONS:
                continue
            fail(f"{file}: ambiguous abbreviation '{bad}_' found; use full descriptive names")


def main() -> None:
    if not MIGRATIONS_DIR.exists():
        fail(f"Missing migration directory: {MIGRATIONS_DIR}")

    for file in sorted(MIGRATIONS_DIR.glob("*.sql")):
        text = file.read_text(encoding="utf-8")

        check_for_bad_abbreviations(text, file)

        for m in TRIGGER_RE.finditer(text):
            check_trigger_name(m.group(1), file, line_at(text, m.start()))

        for m in INDEX_RE.finditer(text):
            check_index_name(m.group(1), file, line_at(text, m.start()))

        for m in FUNCTION_RE.finditer(text):
            check_function_name(m.group(1), file, line_at(text, m.start()))

        for m in POLICY_RE.finditer(text):
            name = m.group(1) or m.group(2) or m.group(3)
            check_policy_name(name, file, line_at(text, m.start()))

        for m in FK_CONSTRAINT_RE.finditer(text):
            check_fk_constraint(m.group(1), file, line_at(text, m.start()))

        for m in UQ_CONSTRAINT_RE.finditer(text):
            check_uq_constraint(m.group(1), file, line_at(text, m.start()))

        for m in CHK_CONSTRAINT_RE.finditer(text):
            check_chk_constraint(m.group(1), file, line_at(text, m.start()))

    print("SQL naming checks passed.")


if __name__ == "__main__":
    main()
