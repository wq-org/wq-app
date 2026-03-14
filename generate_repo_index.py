"""
collect_index_files.py

Scans the repository for every `index.ts` file, collects its content
and relative path, then writes a single Markdown file for review.

Usage:
    python collect_index_files.py                  # repo root = script's own directory
    python collect_index_files.py /path/to/repo    # explicit repo root
"""
from __future__ import annotations

import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
OUTPUT_FILE = "repo.index.md"
TARGET_FILENAME = "index.ts"

IGNORE_DIRS: frozenset[str] = frozenset(
    {
        "node_modules",
        "dist",
        "build",
        ".next",
        "coverage",
        ".git",
        ".turbo",
        ".vercel",
        "out",
        ".cache",
        "tmp",
        ".claude"
        ".cursor"
    }
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def should_ignore(path: Path, repo_root: Path) -> bool:
    """Return True if any segment of the path (relative to repo root) is in IGNORE_DIRS."""
    try:
        relative = path.relative_to(repo_root)
    except ValueError:
        return True  # Path is outside repo root — skip it
    return any(part in IGNORE_DIRS for part in relative.parts)


def find_index_files(repo_root: Path) -> list[Path]:
    """Recursively find all TARGET_FILENAME files, excluding ignored dirs."""
    files: list[Path] = [
        p
        for p in repo_root.rglob(TARGET_FILENAME)
        if p.is_file() and not should_ignore(p, repo_root)
    ]
    return sorted(files, key=lambda p: p.relative_to(repo_root).as_posix().lower())


def build_markdown(repo_root: Path, files: list[Path]) -> str:
    """Render collected files into a single Markdown document."""
    header = (
        f"# Repository Index — `{TARGET_FILENAME}` files\n\n"
        f"> Repo root: `{repo_root.as_posix()}`  \n"
        f"> Files found: **{len(files)}**\n\n"
        "---\n\n"
    )

    sections: list[str] = []

    for file_path in files:
        relative_path = file_path.relative_to(repo_root).as_posix()

        try:
            content = file_path.read_text(encoding="utf-8", errors="replace").rstrip()
        except OSError as exc:
            content = f"# ERROR reading file: {exc}"

        sections.append(
            f"## `{relative_path}`\n\n"
            f"```ts\n"
            f"{content}\n"
            f"```\n"
        )

    return header + "\n".join(sections) + ("\n" if sections else "")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main() -> None:
    # Prefer an explicit CLI argument; fall back to the script's own directory
    # so the script can live at the repo root and always resolve correctly.
    if len(sys.argv) > 1:
        repo_root = Path(sys.argv[1]).resolve()
    else:
        repo_root = Path(__file__).resolve().parent

    if not repo_root.is_dir():
        print(f"ERROR: '{repo_root}' is not a valid directory.", file=sys.stderr)
        sys.exit(1)

    print(f"Scanning from repo root: {repo_root}")

    files = find_index_files(repo_root)

    if not files:
        print("No index.ts files found — check your IGNORE_DIRS or repo root path.")
        return

    output = build_markdown(repo_root, files)
    output_path = repo_root / OUTPUT_FILE
    output_path.write_text(output, encoding="utf-8")

    print(f"Scanned  : {len(files)} file(s)")
    print(f"Output   : {output_path}")


if __name__ == "__main__":
    main()