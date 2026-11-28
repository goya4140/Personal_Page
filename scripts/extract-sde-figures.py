"""Render original SDE figure excerpts: python3 scripts/extract-sde-figures.py PDF_PATH."""
from pathlib import Path
import json
import sys
import pymupdf

root = Path(__file__).resolve().parents[1]
pdf = pymupdf.open(sys.argv[1])
out = root / 'assets/img/blog/scientific-discovery-evaluation'
out.mkdir(parents=True, exist_ok=True)
regions = [
    ('framework', 3, [82, 224, 538, 413], '1c'),
    ('scenario-profiles', 5, [80, 68, 367, 190], '2a (Biology and Chemistry)'),
    ('project-results', 10, [185, 69, 538, 320], '4a (eight project results)'),
    ('tmc-search', 10, [92, 321, 538, 433], '4b'),
]
manifest = {
    'source': 'https://arxiv.org/pdf/2512.15567v2',
    'version': 'v2, 2026-05-08',
    'attribution': 'Zhangde Song et al., Evaluating Large Language Models in Scientific Discovery',
    'source_license': 'arXiv.org perpetual non-exclusive license; not a CC BY declaration',
    'usage': 'Attributed excerpts accompanying discussion of the original methods and findings',
    'figures': [],
}
for name, page, clip, panel in regions:
    pdf[page-1].get_pixmap(matrix=pymupdf.Matrix(4,4), clip=pymupdf.Rect(clip), alpha=False).save(out/f'{name}.png')
    manifest['figures'].append({'file':f'{name}.png', 'pdf_page':page,
                               'original_figure_panel':panel, 'clip_points':clip,
                               'operation':'Excerpted original panel; no redrawing or data changes; rendered at 4x'})
(out/'sources.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'Rendered {len(regions)} original figure excerpts.')
