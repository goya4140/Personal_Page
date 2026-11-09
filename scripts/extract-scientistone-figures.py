"""Render original ScientistOne figures. Usage: python3 scripts/extract-scientistone-figures.py PDF_PATH"""
from pathlib import Path
import json
import sys
import pymupdf

root = Path(__file__).resolve().parents[1]
pdf = pymupdf.open(sys.argv[1])
out = root / 'assets/img/blog/scientistone'
out.mkdir(parents=True, exist_ok=True)
regions = [
    ('pipeline', 5, [61, 80, 535, 289], 1),
    ('integrity-audit', 6, [61, 80, 535, 260], 2),
]
manifest = {
    'source': 'https://arxiv.org/pdf/2605.26340v1',
    'license': 'CC BY 4.0',
    'attribution': 'Rui Meng et al. ScientistOne (2026)',
    'figures': [],
}
for name, page, clip, number in regions:
    image = pdf[page - 1].get_pixmap(matrix=pymupdf.Matrix(4, 4), clip=pymupdf.Rect(clip), alpha=False)
    image.save(out / f'{name}.png')
    manifest['figures'].append({
        'file': f'{name}.png', 'pdf_page': page, 'figure': number,
        'clip_points': clip,
        'operation': 'Cropped surrounding page content; original figure unchanged; rendered at 4x',
    })
(out / 'sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Rendered {len(regions)} original figures into {out}')
