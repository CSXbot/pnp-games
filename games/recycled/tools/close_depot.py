"""Rebuild the registered Planet 1 Depot from its original embedded print image.

Run close_depot.py [SHEET1_PLANET1.pdf]. The outline, repaired manual corner and
lower rail are the approved art masters. Rebuilding needs Pillow and Poppler's
pdfimages. All positions are in native Sheet 1 pixels.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import subprocess
import tempfile

from PIL import Image

GAME = Path(__file__).resolve().parents[1]
MASTERS = GAME / "tools/depot"
DEFAULT_SHEET = GAME.parents[1] / "sources/recycled/EN A4 Sheet1 Planet1-compressed.pdf"
REPAIR_ORIGIN = (503, 1080)


def restore_depot(pdf: Path, output: Path) -> None:
    with tempfile.TemporaryDirectory() as folder:
        prefix = Path(folder) / "sheet"
        subprocess.run(["pdfimages", "-f", "1", "-l", "1", "-j", str(pdf), str(prefix)], check=True)
        with Image.open(prefix.with_name("sheet-000.jpg")) as page:
            if page.size != (2480, 3508):
                raise ValueError(f"Expected a 2480 × 3508 Planet 1 sheet, got {page.size}")
            with Image.open(MASTERS / "outline.png") as outline:
                image = page.convert("RGB").crop((0, 0, *outline.size))
                with Image.open(MASTERS / "lower-repair.webp") as patch:
                    patch = patch.convert("RGBA")
                    image.paste(patch, REPAIR_ORIGIN, patch.getchannel("A"))
                image.putalpha(outline.convert("L"))
    output.mkdir(parents=True, exist_ok=True)
    image.save(output / "depot.webp", lossless=True, method=6)
    geometry = dict(x0=0, y0=0, width=image.width, height=image.height)
    (output / "depot.json").write_text(json.dumps(geometry) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sheet", nargs="?", type=Path, default=DEFAULT_SHEET)
    parser.add_argument("--force", action="store_true", help=argparse.SUPPRESS)
    options = parser.parse_args()
    restore_depot(options.sheet, GAME / "src/assets/art")
