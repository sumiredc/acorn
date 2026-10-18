"""Draws the app icons from the pixel logo in src/ui/logoPixels.ts.

Run from mobile/: uv run --with pillow python scripts/make-icons.py
"""

import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = (ROOT / "src/ui/logoPixels.ts").read_text()
PIXELS = re.findall(r"^\s+'([^']+)',$", SOURCE, re.M)
COLORS = dict(re.findall(r"^\s+(\w): '(#[0-9a-f]{6})',$", SOURCE, re.M))
BACKGROUND = "#f3efe2"
OUT = ROOT / "assets/images"


def draw(size: int, scale: float, background: str | None, mono: bool = False) -> Image.Image:
    image = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    pixel = int(size * scale / len(PIXELS))
    offset = (size - pixel * len(PIXELS)) // 2
    for y, row in enumerate(PIXELS):
        for x, cell in enumerate(row):
            if cell == ".":
                continue
            color = "#000000" if mono else COLORS[cell]
            box = (offset + x * pixel, offset + y * pixel)
            image.paste(color, (*box, box[0] + pixel, box[1] + pixel))
    return image


draw(1024, 0.75, BACKGROUND).save(OUT / "icon.png")
draw(48, 1.0, None).save(OUT / "favicon.png")
draw(512, 1.0, None).save(OUT / "splash-icon.png")
draw(1024, 0.5, None).save(OUT / "android-icon-foreground.png")
draw(1024, 0.5, None, mono=True).save(OUT / "android-icon-monochrome.png")
