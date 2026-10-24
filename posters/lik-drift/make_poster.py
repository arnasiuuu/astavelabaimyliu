"""Smoke Ledger — LIK DRIFT poster.

Usage: python3 make_poster.py <photo_dir> <out.png>
Expects the six source photos in <photo_dir> (names listed in HERO / TILES).
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageOps

FONTS = Path(__file__).resolve().parents[2] / ".claude/skills/canvas-design/canvas-fonts"

W, H = 2480, 3508          # A-series ratio, 300 dpi A4
M = 150                    # outer margin
INNER = W - 2 * M

INK = (14, 14, 12)
BONE = (232, 228, 218)
GRAPHITE = (128, 126, 118)
# Lithuanian tricolour, as taped on the B-pillar
YELLOW, GREEN, RED = (253, 185, 19), (0, 106, 68), (193, 39, 45)

HERO = ("54c363d8-image.jpg", (0.50, 0.55))
# (file, crop centre, zoom, caption) — zoom keeps the cars at a shared scale
TILES = [
    ("1af573ea-image.jpg", (0.52, 0.48), 1.6, "PIT"),
    ("d2e10786-image.jpg", (0.53, 0.67), 2.2, "E90 · ŽALIA"),
    ("cf27b767-image.jpg", (0.40, 0.58), 1.5, "E46 · PANNING"),
    ("5f666b49-image.jpg", (0.67, 0.66), 2.6, "E46 · DŪMAI"),
    ("c4e26ecc-image.jpg", (0.37, 0.60), 1.75, "E90 · PRIEŠ SAULĘ"),
]


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def grade(img):
    """Pull every frame toward one shared, slightly muted film stock."""
    img = ImageEnhance.Color(img).enhance(0.88)
    img = ImageEnhance.Contrast(img).enhance(1.06)
    a = np.asarray(img).astype(np.float32)
    a = a * np.array([1.0, 0.985, 0.95]) + np.array([4, 3, 0])   # warm shift
    a = 12 + a * (243 / 255)                                        # lifted blacks
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def cover(path, size, centering, zoom=1.0):
    img = Image.open(path).convert("RGB")
    if zoom > 1:
        w, h = img.size
        cw, ch = w / zoom, h / zoom
        x0 = min(max(centering[0] * w - cw / 2, 0), w - cw)
        y0 = min(max(centering[1] * h - ch / 2, 0), h - ch)
        img = img.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch)))
        centering = (0.5, 0.5)
    return grade(ImageOps.fit(img, size, Image.LANCZOS, centering=centering))


def text_w(draw, s, f, tracking=0):
    return draw.textlength(s, font=f) + tracking * (len(s) - 1)


def tracked(draw, xy, s, f, fill, tracking=0, anchor="ls"):
    x, y = xy
    if anchor[0] == "r":
        x -= text_w(draw, s, f, tracking)
    for ch in s:
        draw.text((x, y), ch, font=f, fill=fill, anchor="l" + anchor[1])
        x += draw.textlength(ch, font=f) + tracking


def main(photo_dir, out):
    photo_dir = Path(photo_dir)
    canvas = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(canvas)

    mono = font("GeistMono-Regular.ttf", 34)
    mono_s = font("GeistMono-Regular.ttf", 27)
    hair = 2

    # header
    y_head = M + 26
    tracked(d, (M, y_head), "LIK DRIFT — LAUKO ARCHYVAS", mono, BONE, 6)
    tracked(d, (W - M, y_head), "Nº 01  /  F.01–F.06", mono, GRAPHITE, 6, anchor="rs")
    d.rectangle([M, M + 62, W - M, M + 62 + hair - 1], fill=GRAPHITE)

    # hero frame
    hero_top = M + 110
    hero_h = 1780
    canvas.paste(cover(photo_dir / HERO[0], (INNER, hero_h), HERO[1]), (M, hero_top))
    hero_bot = hero_top + hero_h
    tracked(d, (M, hero_bot + 52), "F.01", mono_s, BONE, 4)
    tracked(d, (M + 120, hero_bot + 52), "E46 · ŠONU", mono_s, GRAPHITE, 4)
    tracked(d, (W - M, hero_bot + 52), "54°N  ·  ASFALTAS  ·  SPALIS", mono_s, GRAPHITE, 4, anchor="rs")

    # monumental title, set to the measure minus the tricolour block
    flag_w, flag_gap = 210, 70
    title = "LIK DRIFT"
    title_measure = INNER - flag_w - flag_gap
    size = 100
    while True:
        f = font("BigShoulders-Bold.ttf", size + 4)
        if text_w(d, title, f, 0) > title_measure:
            break
        size += 4
    tf = font("BigShoulders-Bold.ttf", size)
    l, t, r, b = d.textbbox((0, 0), title, font=tf, anchor="ls")
    cap_h = -t
    title_base = hero_bot + 130 + cap_h
    d.text((M - l, title_base), title, font=tf, fill=BONE, anchor="ls")

    # tricolour: three stacked bars, exactly cap height
    fx = W - M - flag_w
    band = cap_h / 3
    for i, c in enumerate((YELLOW, GREEN, RED)):
        y0 = title_base - cap_h + round(i * band)
        y1 = title_base - cap_h + round((i + 1) * band) - 1
        d.rectangle([fx, y0, W - M - 1, y1], fill=c)

    # sub-line
    y_sub = title_base + 100
    sub = font("InstrumentSans-Regular.ttf", 46)
    tracked(d, (M, y_sub), "Šonu.  Dūmuose.  Rudenį.", sub, BONE, 1)
    tracked(d, (W - M, y_sub), "LIETUVOS INŽINERIJOS KOLEGIJA", mono_s, GRAPHITE, 5, anchor="rs")
    d.rectangle([M, y_sub + 46, W - M, y_sub + 46 + hair - 1], fill=GRAPHITE)

    # contact row
    gap = 22
    tile_w = (INNER - gap * (len(TILES) - 1)) // len(TILES)
    tile_h = round(tile_w * 0.78)
    row_top = y_sub + 46 + 56
    for i, (name, cen, zoom, cap) in enumerate(TILES):
        x = M + i * (tile_w + gap)
        canvas.paste(cover(photo_dir / name, (tile_w, tile_h), cen, zoom), (x, row_top))
        tracked(d, (x, row_top + tile_h + 44), f"F.0{i + 2}", mono_s, BONE, 4)
        tracked(d, (x + 92, row_top + tile_h + 44), cap, mono_s, GRAPHITE, 2)

    # footer
    y_foot = H - M
    d.rectangle([M, y_foot - 62, W - M, y_foot - 62 + hair - 1], fill=GRAPHITE)
    tracked(d, (M, y_foot), "SMOKE LEDGER", mono_s, GRAPHITE, 8)
    tracked(d, (W - M, y_foot), "2026", mono_s, BONE, 8, anchor="rs")

    # unify image and ground with one shared grain
    rng = np.random.default_rng(7)
    a = np.asarray(canvas).astype(np.float32)
    a += rng.normal(0, 5.5, (H, W, 1))
    canvas = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

    canvas.save(out, dpi=(300, 300), optimize=True)
    print(out, canvas.size, "contact row bottom:", row_top + tile_h + 44, "footer rule:", y_foot - 62)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
