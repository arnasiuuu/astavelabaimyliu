"""Prepare layers for the showcase posters.

Usage: python3 prep.py <cutout_dir> <out_dir>
<cutout_dir> holds e46-smoke_nobg.png and e90-green_nobg.png, made with the
background-removal skill:
    python3 ~/.claude/skills/background-removal/scripts/remove_bg.py <dir> --method rembg
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def clean_cutout(src, dst, keep_px=40, scale=2):
    """Keep the car plus only the smoke touching it, crop, upscale and sharpen."""
    im = Image.open(src).convert("RGBA")
    a = np.asarray(im).copy()
    alpha = a[..., 3].astype(np.float32)

    solid = alpha > 140
    labels, n = ndimage.label(solid)
    sizes = ndimage.sum(solid, labels, range(1, n + 1))
    car = labels == (int(np.argmax(sizes)) + 1)
    near = ndimage.binary_dilation(car, iterations=keep_px)
    # soft falloff so the trimmed smoke does not end on a hard edge
    falloff = ndimage.gaussian_filter(near.astype(np.float32), keep_px / 2)
    alpha = np.where(car, alpha, alpha * np.clip(falloff * 1.4, 0, 1))
    alpha[alpha < 18] = 0
    a[..., 3] = alpha.astype(np.uint8)

    out = Image.fromarray(a)
    out = out.crop(out.getbbox())
    out = out.resize((out.width * scale, out.height * scale), Image.LANCZOS)
    rgb = out.convert("RGB").filter(ImageFilter.UnsharpMask(radius=2.4, percent=90, threshold=2))
    rgb.putalpha(out.getchannel("A"))
    rgb.save(dst)
    print(dst, rgb.size)


def sparkles(dst, w=2480, h=3508, n=420, stars=26, seed=46):
    """Dust-in-the-light sparkles: soft dots plus a few four-point stars."""
    rng = np.random.default_rng(seed)
    layer = np.zeros((h, w), np.float32)
    ys, xs = rng.integers(0, h, n), rng.integers(0, w, n)
    layer[ys, xs] = rng.uniform(0.3, 1.0, n) ** 2
    layer = ndimage.gaussian_filter(layer, 1.6) * 30
    big = np.zeros_like(layer)
    for _ in range(stars):
        x, y, r = rng.integers(80, w - 80), rng.integers(80, int(h * 0.75)), rng.integers(18, 60)
        big[y, x - r:x + r] += np.hanning(2 * r)
        big[y - r:y + r, x] += np.hanning(2 * r)
        big[y, x] += 3
    big = ndimage.gaussian_filter(big, 1.2) * 1.6
    alpha = np.clip(layer + big, 0, 1)
    rgba = np.zeros((h, w, 4), np.uint8)
    rgba[..., :3] = (255, 246, 228)
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    Image.fromarray(rgba).save(dst)
    print(dst)


if __name__ == "__main__":
    cut, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    clean_cutout(cut / "e46-smoke_nobg.png", out / "e46-car.png", keep_px=60)
    clean_cutout(cut / "e90-green_nobg.png", out / "e90-car.png", keep_px=30)
    sparkles(out / "sparkles.png")
