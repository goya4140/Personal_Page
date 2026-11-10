# Linhao Wang · 王邻皓

A bilingual academic homepage and research-reading blog based on the MIT-licensed [Luka Homepage Template](https://github.com/wzsyyh/luka-homepage-template).

## Preview and build

```sh
npm ci
npm run build
npm run check
npm run dev
```

The development server serves the generated HTML in this repository at `http://127.0.0.1:4173`. Production output is in `dist/`.

- Chinese homepage: `/`; blog: `/blog/`.
- English homepage: `/en/`; blog: `/en/blog/`.
- Each of the 17 articles has a complete Chinese and English reading page, including translated captions, tables, and contents.
- The language button keeps the current article, section anchor, and archive search/filter. Theme preferences are stored locally.
- Article and archive covers appear beside titles on larger screens and adapt for smaller screens.
- ScientistTwo is pinned with the corresponding Chinese or English poster. The poster gallery offers PNG, one-page PDF, editable HTML, and complete asset/provenance bundles.

## Authoring

Public navigation uses directory URLs without `.html`. `scripts/clean-routes.mjs` rebases assets and links, publishes `.../index.html`, and retains legacy `.html` redirects. The old `/Personal_Page/` address redirects to the personal root site.

- `scripts/personalize.py`: homepage source. Do not edit generated `index.html` directly.
- `content/posts/<slug>.md`: Chinese original.
- `content/posts/en/<slug>.md`: complete English translation.
- `content/translations.json`: source/translation checksums for this revision.
- `data/posts.json`: bilingual titles, summaries, tags, dates, covers, and pinned status.
- `data/research.json`: bilingual research experience and publication status.
- `scripts/build-blog.mjs` and `scripts/blog-pages.mjs`: Markdown/KaTeX rendering and localized page generation.
- `scripts/check-site.mjs`: checks translation structure, table values, reference URLs, and generated local links/assets.
- `assets/posters/scientisttwo/`: original verified poster closures and bilingual gallery.
- `content/templates/` and `AGENTS.md`: paper-reading writing conventions.

When editing an article, update both language files and refresh the matching checksums in `content/translations.json`. Run the build and checks before publication. Existing Chinese text and original paper figures are preserved; source-figure labels remain in their original language.

## Hosting

Live site: [Chinese](https://goya4140.github.io/) · [English](https://goya4140.github.io/en/) · [Blog](https://goya4140.github.io/blog/).

GitHub Pages publishes the tracked static site from the root of the default branch. The `.nojekyll` marker preserves the generated HTML and assets without Jekyll processing.

The static pages use relative URLs and support both a domain root and a GitHub Pages project subdirectory. Publish `dist/`, or serve the tracked generated HTML and assets directly. Private Sites configuration and local import/source records are managed separately from a public GitHub export.

The CV download is explicitly labeled as Chinese. Source credits accompany paper illustrations. Research entries use an image/text layout inspired by [w-r-s/academic-homepage-template](https://github.com/w-r-s/academic-homepage-template).

Original template documentation: `README.zh-CN.md`. License: `LICENSE.md`.

## 中文说明

这是中英双语个人主页，包含 17 篇完整的中文原稿及英文译文。中英文版分别使用对应海报；正文标题旁展示插图，ScientistTwo 海报在博客和文章顶部置顶。手机端采用上下布局。

日常修改应编辑 `content/posts/`、`data/` 与生成脚本，再运行 `npm run build` 和 `npm run check`。中文正文保持原有内容；英文版包含目录、图注与表格。不要仅修改生成的 HTML。
