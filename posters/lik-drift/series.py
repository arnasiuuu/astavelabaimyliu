"""Smoke Ledger — posters Nº 02–05, plus the full-series PDF and overview.

Usage: python3 series.py <photo_dir> <out_dir>
Run make_poster.py first; Nº 01 is read from <out_dir>/lik-drift-poster.png.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from make_poster import BONE, GREEN, H, INK, INNER, M, RED, W, YELLOW, cover, font, text_w, tracked

TOTAL = 5
HAIR = 2
TITLE_FONT = "BigShoulders-Bold.ttf"


def mono(size=27):
    return font("GeistMono-Regular.ttf", size)


def grain(canvas, seed):
    rng = np.random.default_rng(seed)
    a = np.asarray(canvas).astype(np.float32)
    a += rng.normal(0, 5.5, (canvas.height, canvas.width, 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def fit_title(d, text, measure, max_cap=None):
    """Largest title size that fits the measure (and optional cap height)."""
    size = 100
    while True:
        f = font(TITLE_FONT, size + 4)
        cap = -d.textbbox((0, 0), "H", font=f, anchor="ls")[1]
        if text_w(d, text, f) > measure or (max_cap and cap > max_cap):
            break
        size += 4
    f = font(TITLE_FONT, size)
    return f, -d.textbbox((0, 0), "H", font=f, anchor="ls")[1]


def draw_title(d, x, base, text, f, fill):
    # optical left alignment: cancel the first glyph's side bearing
    left = d.textbbox((0, 0), text, font=f, anchor="ls")[0]
    d.text((x - left, base), text, font=f, fill=fill, anchor="ls")


def rule(d, y, colour, x0=M, x1=W - M):
    d.rectangle([x0, y, x1, y + HAIR - 1], fill=colour)


def header(d, n, ink, dim, y=M + 26):
    tracked(d, (M, y), "LIK DRIFT — LAUKO ARCHYVAS", mono(34), ink, 6)
    tracked(d, (W - M, y), f"Nº 0{n}  /  0{TOTAL}", mono(34), dim, 6, anchor="rs")
    rule(d, y + 36, dim)


def footer(d, left, right, ink, dim):
    y = H - M
    rule(d, y - 62, dim)
    tracked(d, (M, y), left, mono(), dim, 8)
    tracked(d, (W - M, y), right, mono(), ink, 8, anchor="rs")


def tricolour(d, x, y, w, h, vertical=False):
    for i, c in enumerate((YELLOW, GREEN, RED)):
        if vertical:   # bands stacked top to bottom
            d.rectangle([x, y + round(i * h / 3), x + w - 1, y + round((i + 1) * h / 3) - 1], fill=c)
        else:          # bands side by side
            d.rectangle([x + round(i * w / 3), y, x + round((i + 1) * w / 3) - 1, y + h - 1], fill=c)


# Nº 02 — ŠONU: the word turned on its side, a slit of the car beside it
def poster_02(photos):
    paper, ink, dim = (236, 232, 222), INK, (120, 117, 108)
    c = Image.new("RGB", (W, H), paper)
    d = ImageDraw.Draw(c)
    header(d, 2, ink, dim)

    top, bot = M + 110, H - M - 110
    span = bot - top
    word = "ŠONU"
    # render horizontally, trim to ink, scale to the full column height, rotate
    probe = font(TITLE_FONT, 1000)
    pd = ImageDraw.Draw(Image.new("L", (1, 1)))
    l, t, r, b = pd.textbbox((0, 0), word, font=probe, anchor="ls")
    size = round(1000 * span / (r - l))
    f = font(TITLE_FONT, size)
    l, t, r, b = pd.textbbox((0, 0), word, font=f, anchor="ls")
    glyphs = Image.new("L", (r - l, b - t), 0)
    ImageDraw.Draw(glyphs).text((-l, -t), word, font=f, fill=255, anchor="ls")
    glyphs = glyphs.rotate(90, expand=True)
    gw, gh = glyphs.size
    c.paste(Image.new("RGB", glyphs.size, ink), (M, top + (span - gh) // 2), glyphs)

    gap = 70
    strip_x = M + gw + gap
    flag_w = 28
    tricolour(d, strip_x, top, flag_w, span, vertical=True)
    img_x = strip_x + flag_w + gap
    img = cover(photos / "cf27b767-image.jpg", (W - M - img_x, span), (0.37, 0.6), 2.3)
    c.paste(img, (img_x, top))

    footer(d, "ŠONU — SIDEWAYS", "E46 · F.04", ink, dim)
    return grain(c, 2)


# Nº 03 — PRIEŠ STARTĄ: the pit, framed like a print on a mount
def poster_03(photos):
    ground, ink, dim = (14, 38, 29), BONE, (122, 140, 128)
    c = Image.new("RGB", (W, H), ground)
    d = ImageDraw.Draw(c)
    header(d, 3, ink, dim)

    side = 1800
    x0 = (W - side) // 2
    f, cap = fit_title(d, "PRIEŠ STARTĄ", side)
    # centre the whole block (print, caption, title, tagline) between header and footer
    block = side + 52 + 110 + cap + 140
    y0 = (M + 62) + ((H - M - 62) - (M + 62) - block) // 2
    c.paste(cover(photos / "1af573ea-image.jpg", (side, side), (0.5, 0.5)), (x0, y0))
    y_cap = y0 + side + 52
    tracked(d, (x0, y_cap), "F.02", mono(), ink, 4)
    tracked(d, (x0 + 120, y_cap), "BOKSAS · ANT B STATRAMSČIO", mono(), dim, 4)

    base = y_cap + 110 + cap
    draw_title(d, x0, base, "PRIEŠ STARTĄ", f, ink)
    desc = d.textbbox((0, 0), "PRIEŠ STARTĄ", font=f, anchor="ls")[3]   # the ogonek hangs below
    row = base + desc + 70
    tricolour(d, x0, row - 14, 150, 14)
    tracked(d, (x0 + side, row), "Tyla prieš dūmus.", font("InstrumentSans-Italic.ttf", 44), ink, 0, anchor="rs")

    footer(d, "LIETUVOS INŽINERIJOS KOLEGIJA", "2026", ink, dim)
    return grain(c, 3)


# Nº 04 — DŪMAI: full-bleed haze, the car small and frontal, the word heavy below
def poster_04(photos):
    paper, ink, dim = (214, 214, 208), (22, 23, 21), (112, 113, 108)
    c = Image.new("RGB", (W, H), paper)
    d = ImageDraw.Draw(c)

    img_h = 2240
    c.paste(cover(photos / "5f666b49-image.jpg", (W, img_h), (0.72, 0.5)), (0, 0))

    y = img_h + 70
    tracked(d, (M, y), "LIK DRIFT — LAUKO ARCHYVAS", mono(34), ink, 6)
    tracked(d, (W - M, y), f"Nº 04  /  0{TOTAL}", mono(34), dim, 6, anchor="rs")
    rule(d, y + 36, dim)

    foot_rule = H - M - 62
    room_top = y + 36 + 90
    f, cap = fit_title(d, "DŪMAI", INNER, max_cap=foot_rule - 90 - room_top - 60)
    base = foot_rule - 90
    draw_title(d, M, base, "DŪMAI", f, ink)
    tricolour(d, W - M - 150, base - cap, 150, 14)

    footer(d, "F.05 · E46 · DNR 969", "2026", ink, dim)
    return grain(c, 4)


# Nº 05 — ŽALIA: green on green, the title above the frame
def poster_05(photos):
    ground, ink, dim = (0, 84, 56), BONE, (150, 190, 168)
    c = Image.new("RGB", (W, H), ground)
    d = ImageDraw.Draw(c)
    header(d, 5, ink, dim)

    f, cap = fit_title(d, "ŽALIA", INNER, max_cap=900)
    accent = d.textbbox((0, 0), "Ž", font=f, anchor="ls")[1]   # caron rises above cap height
    base = M + 110 + 40 - accent
    draw_title(d, M, base, "ŽALIA", f, ink)

    img_top = base + 110
    img_h = 1620
    c.paste(cover(photos / "d2e10786-image.jpg", (INNER, img_h), (0.53, 0.66), 1.7), (M, img_top))
    y_cap = img_top + img_h + 52
    tracked(d, (M, y_cap), "F.03", mono(), ink, 4)
    tracked(d, (M + 120, y_cap), "E90 · LIK DRIFT", mono(), dim, 4)
    tracked(d, (W - M, y_cap), "Šonu. Dūmuose. Rudenį.", font("InstrumentSans-Regular.ttf", 44), ink, 0, anchor="rs")

    footer(d, "LIETUVOS INŽINERIJOS KOLEGIJA", "2026", ink, dim)
    return grain(c, 5)


def main(photo_dir, out_dir):
    photos, out = Path(photo_dir), Path(out_dir)
    pages = [Image.open(out / "lik-drift-poster.png").convert("RGB")]
    for n, make in enumerate((poster_02, poster_03, poster_04, poster_05), start=2):
        page = make(photos)
        page.save(out / f"lik-drift-0{n}.png", dpi=(300, 300), optimize=True)
        pages.append(page)

    pages[0].save(out / "lik-drift-series.pdf", save_all=True, append_images=pages[1:], resolution=300)

    # overview: all five side by side on the darkest ground
    tw, th, g = 620, round(620 * H / W), 60
    sheet = Image.new("RGB", (g + TOTAL * (tw + g), th + 2 * g), (8, 8, 7))
    for i, p in enumerate(pages):
        sheet.paste(p.resize((tw, th), Image.LANCZOS), (g + i * (tw + g), g))
    sheet.save(out / "lik-drift-series-overview.jpg", quality=90)
    print("wrote", len(pages), "posters to", out)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
