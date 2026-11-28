"""Render unchanged paper figure regions. Usage: python3 scripts/extract-scientisttwo-figures.py PDF_PATH"""
from pathlib import Path
import json
import sys
import pymupdf

root = Path(__file__).resolve().parents[1]
pdf = pymupdf.open(sys.argv[1])
out = root / 'assets/img/blog/scientisttwo'
out.mkdir(parents=True, exist_ok=True)
regions = [
    ('overview', 4, [61, 83, 535, 246], 3),
    ('experiment-flow', 7, [61, 80, 535, 158], 5),
    ('review-loop', 9, [61, 80, 535, 205], 7),
    ('idea-refinement', 13, [61, 79, 535, 270], 9),
]
manifest = {'source': 'https://arxiv.org/pdf/2609.19644v1',
            'license': 'CC BY 4.0',
            'attribution': 'Jaehyun Nam et al. ScientistTwo (2026)', 'figures': []}
for name, page, clip, number in regions:
    image = pdf[page-1].get_pixmap(matrix=pymupdf.Matrix(4, 4), clip=pymupdf.Rect(clip), alpha=False)
    image.save(out / f'{name}.png')
    manifest['figures'].append({'file': f'{name}.png', 'pdf_page': page,
                               'figure': number, 'clip_points': clip,
                               'operation': 'Cropped surrounding page content; original figure unchanged; rendered at 4x'})
(out / 'sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Rendered {len(regions)} original figures into {out}')
