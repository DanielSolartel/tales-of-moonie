"""Offline atlas cleanup. Requires Pillow, numpy and scipy; never runs in the game.

Rebuild from the immutable pre-fix atlas in Git, preserving every silhouette,
rectangle and anchor. No resizing, dithering, new illustration or runtime filter.
"""
import io
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import distance_transform_edt

ROOT = Path(__file__).resolve().parents[1]
ASSET = 'public/assets/moonie-poses-referencias.png'
SOURCE = 'b0ea2aa23a74f542bca859b3aac1fdd0e5ed1d59'
raw = subprocess.check_output(['git', 'show', f'{SOURCE}:{ASSET}'], cwd=ROOT)
source = Image.open(io.BytesIO(raw)).convert('RGBA')
pixels = np.array(source)
alpha = source.getchannel('A')
mask = pixels[:, :, 3] > 0
# Extend colors beyond the silhouette only for the filter's neighbourhood.
# This prevents transparent black from creating dark fringes. Alpha never changes.
_, nearest = distance_transform_edt(~mask, return_indices=True)
rgb = Image.fromarray(pixels[:, :, :3][tuple(nearest)])
sharp = rgb.filter(ImageFilter.UnsharpMask(radius=.65, percent=110, threshold=7))
result = Image.new('RGBA', source.size)
for y, height in [(0, 67), (67, 69), (136, 65)]:
    box = (0, y, source.width, y + height)
    original = np.array(source.crop(box))
    colors = original[:, :, :3][original[:, :, 3] > 0]
    # Original colors supply the palette: sharpening cannot introduce new hues.
    palette = Image.fromarray(colors.reshape(1, -1, 3)).quantize(
        colors=48, method=Image.Quantize.MEDIANCUT)
    tile = sharp.crop(box).quantize(palette=palette, dither=Image.Dither.NONE).convert('RGBA')
    tile.putalpha(alpha.crop(box))
    result.paste(tile, (0, y))
assert np.array_equal(np.array(result)[:, :, 3], pixels[:, :, 3])
assert result.size == source.size
clean = np.array(result)
clean[~mask] = 0
result = Image.fromarray(clean)
result.save(ROOT / ASSET)
print('18 poses: original dimensions and alpha preserved; 48 colors per outfit, no dithering.')
