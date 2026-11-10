import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';

export async function renderBlogs({md,home,posts,esc,bi,header,footer,head}) {
 const sources=new Map();
 for(const p of posts){
  const zh=await readFile(`content/posts/${p.slug}.md`,'utf8');
  const en=await readFile(`content/posts/en/${p.slug}.md`,'utf8');
  let notes=[];
  try { notes=JSON.parse(await readFile(`content/annotations/${p.slug}.json`,'utf8')); }
  catch(error) { if(error.code!=='ENOENT')throw error; }
  const minutes=s=>Math.max(1,Math.ceil((s.match(/[\u3400-\u9fff]/g)||[]).length/380+(s.match(/[A-Za-z]+/g)||[]).length/220));
  sources.set(p.slug,{zh,en,notes,minutes:{zh:minutes(zh),en:minutes(en)}});
  p.cover=p.cover||zh.match(/!\[[^\]]*\]\(([^\s)]+)/)?.[1]?.replace(/^\.\.\//,'');
 }
 for(const locale of ['zh','en']){
  const en=locale==='en', dir=en?'en/':'';
  const t=(zh,english)=>en?english:zh;
  const title=p=>p[`title_${locale}`];
  const summary=p=>p[`summary_${locale}`];
  const kind=p=>p.kind==='reading'?t('论文阅读','Paper reading'):t('科研笔记','Research notes');
  const asset=(p,depth)=>/^(https?:|data:)/.test(p)?p:'../'.repeat(depth)+p;
  const cover=p=>p.covers?.[locale]||p.cover;
  const thumb=(p,depth,cls)=>cover(p)?`<img class="${cls}" src="${esc(asset(cover(p),depth))}" alt="${esc(title(p))}" width="3072" height="1536" loading="lazy" decoding="async">`:'';
  const topics=p=>`<div class="post-topics">${p[`tags_${locale}`].map(tag=>`<span>${esc(tag)}</span>`).join('')}</div>`;
  const minutes=p=>sources.get(p.slug).minutes[locale];
  const nav=depth=>header.replaceAll('href="index.html"',`href="${'../'.repeat(depth)}index.html"`).replaceAll('href="blog.html"',`href="${'../'.repeat(depth)}blog.html"`);
  function pageHead(p,article=false){
   const depth=(en?1:0)+(article?1:0), other=article?`${p.slug}.html`:'blog.html';
   const alternate=en?(article?`../../blog/${other}`:'../blog.html'):(article?`../en/blog/${other}`:'en/blog.html');
   let h=head(p,false).replaceAll('href="assets/',`href="${'../'.repeat(depth)}assets/`).replaceAll('src="assets/',`src="${'../'.repeat(depth)}assets/`);
   h=h.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(p?title(p)+' | Linhao Wang':t('Blog · 王邻皓','Blog | Linhao Wang'))}</title>`)
    .replace(/<meta name="description"[^>]+>/,`<meta name="description" content="${esc(p?summary(p):t('科研笔记与论文阅读。','Research notes and paper readings.'))}">`)
    .replace(/<meta property="og:title"[^>]+>/,`<meta property="og:title" content="${esc(p?title(p):'Blog | Linhao Wang')}">`)
    .replace(/<meta property="og:description"[^>]+>/,`<meta property="og:description" content="${esc(p?summary(p):t('科研笔记与论文阅读。','Research notes and paper readings.'))}">`)
    .replace('</head>',`<link rel="alternate" hreflang="${en?'zh-CN':'en'}" href="${alternate}"></head>`);
   return h;
  }
  await mkdir(dir||'.',{recursive:true});
  await rm(`${dir}blog`,{recursive:true,force:true});await mkdir(`${dir}blog`,{recursive:true});
  for(const p of posts){
   const notes=sources.get(p.slug).notes;
   const env={locale,notes}, tokens=md.parse(sources.get(p.slug)[locale],env), headings=[];
   for(let i=0;i<tokens.length;i++)if(tokens[i].type==='heading_open'){
    const id=`section-${headings.length+1}`;tokens[i].attrSet('id',id);
    headings.push({id,level:Number(tokens[i].tag.slice(1)),title:tokens[i+1].content.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/[*`]/g,'')});
   }
   const body=md.renderer.render(tokens,md.options,env);
   const notePanels=notes.map(note=>{
    if(!/^[a-z][a-z0-9-]*$/.test(note.id))throw new Error(`Invalid note id: ${note.id}`);
    const id=`reading-note-${note.id}`,copy=note[locale];
    if(!copy?.question||!copy.answer||!copy.detail)throw new Error(`Incomplete ${locale} note: ${note.id}`);
    return `<aside id="${id}" class="reading-note-panel" popover="auto" role="dialog" aria-modal="false" aria-labelledby="${id}-title" tabindex="-1"><div class="reading-note-top"><span>${t('阅读问答','READING Q&A')}</span><button type="button" class="reading-note-close" popovertarget="${id}" popovertargetaction="hide" aria-label="${t('关闭解释','Close explanation')}">×</button></div><p class="reading-note-title" id="${id}-title">${esc(copy.question)}</p><div class="reading-note-answer">${md.render(copy.answer,{locale})}</div><details class="reading-note-detail"><summary>${esc(copy.detail_label)}</summary><div class="reading-note-answer">${md.render(copy.detail,{locale})}</div></details></aside>`;
   }).join('');
   const toc=headings.filter(h=>h.level<=2).map(h=>`<li><a href="#${h.id}">${esc(h.title)}</a></li>`).join('');
   const depth=en?2:1, base='../'.repeat(depth), switchUrl=en?`../../blog/${p.slug}.html`:`../en/blog/${p.slug}.html`;
   const gallery=p.posters?`${base}${p.posters}${en?'?lang=en':''}`:'';
   const hero=cover(p)?`<a class="article-heading-art" href="${esc(gallery||asset(cover(p),depth))}"${gallery?'':' target="_blank" rel="noopener"'}>${thumb(p,depth,'article-heading-image')}<span>${t('点击查看大图','View full size')} ↗</span></a>`:'';
   const paper=p.paper?`<div class="article-paper"><span>${t('阅读论文','Paper')}</span><a href="${esc(p.paper.url)}" target="_blank" rel="noopener noreferrer">${esc(p.paper.title)} ↗</a>${p.paper.venue?`<small>${esc(p.paper.venue)}</small>`:''}</div>`:'';
   const poster=p.posters?`<section class="pinned-poster" aria-label="${t('置顶海报速览','Pinned poster overview')}"><div class="poster-heading"><strong>${t('一图回顾','At a glance')}</strong><a href="${gallery}">${t('中英文海报与完整文件','Both posters & complete files')} ↗</a></div><a href="${base}assets/posters/${p.slug}/${locale}/preview.png" target="_blank" rel="noopener"><img src="${base}assets/posters/${p.slug}/${locale}/preview.png" alt="${esc(title(p))} — ${t('中文海报','English poster')}" width="3072" height="1536"></a><p><a href="${base}assets/posters/${p.slug}/${locale}/poster.pdf" target="_blank" rel="noopener">PDF ↗</a><span>${t('点击海报放大；原论文插图保留原始标注。','Click the poster to enlarge; source figures retain their original labels.')}</span></p></section>`:'';
   const related=posts.filter(o=>o.slug!==p.slug).map(o=>({o,score:o.tags_zh.filter(tag=>p.tags_zh.includes(tag)).length})).sort((a,b)=>b.score-a.score).slice(0,3).map(({o})=>`<a href="${o.slug}.html"><span>${kind(o)}</span><strong>${esc(title(o))}</strong><i aria-hidden="true">↗</i></a>`).join('');
   const html=`<!doctype html><html lang="${en?'en':'zh-CN'}" data-locale="${locale}">${pageHead(p,true)}<body class="theme-luka blog-page article-page" data-page="article" data-title-zh="${esc(p.title_zh)}" data-title-en="${esc(p.title_en)}" data-language-url="${switchUrl}"><div class="reading-progress" aria-hidden="true"></div><a class="skip-link" href="#article-content">${t('跳至正文','Skip to content')}</a>${nav(1)}<main class="article-main"><a class="article-back" href="../blog.html">← ${t('全部文章','All writing')}</a><header class="article-header"><div class="post-meta"><span class="post-kind">${kind(p)}</span><span>${t('约 '+minutes(p)+' 分钟',minutes(p)+' min read')}</span><span>${t('中文原稿','English translation')}</span>${p.date?`<time datetime="${p.date}">${p.date}</time>`:''}</div><div class="article-heading-layout${hero?' has-art':''}"><div><h1>${esc(title(p))}</h1><p class="article-summary">${esc(summary(p))}</p>${topics(p)}</div>${hero}</div>${paper}</header>${poster}<div class="article-layout"><div class="article-column"><details class="mobile-toc"><summary>${t('本文目录','On this page')}</summary><ol>${toc}</ol></details><article class="article-prose" id="article-content" lang="${en?'en':'zh-CN'}">${body}</article><div class="article-note">${t('整理自既有科研与阅读笔记。文献结果按原文设置理解，与笔记中的分析、建议及示例区分阅读。','From research and reading notes. Interpret reported findings within the original settings, separately from our analyses, proposals, and illustrative examples.')}</div></div><aside class="article-toc" aria-label="${t('本文目录','Table of contents')}"><h2>${t('本文目录','On this page')}</h2><ol>${toc}</ol><a href="../blog.html">← Blog</a></aside></div><section class="related-writing"><h2>${t('继续阅读','Keep reading')}</h2>${related}</section></main>${footer}${notePanels}<script src="${base}assets/js/homepage.js"></script><script src="${base}assets/js/article.js"></script></body></html>`;
   await writeFile(`${dir}blog/${p.slug}.html`,html);
  }
  const first=posts.find(p=>p.pinned)||posts[0], depth=en?1:0;
  const row=p=>`<article class="writing-row${cover(p)?' has-cover':''}" data-kind="${p.kind}" data-search="${esc([p.title_zh,p.title_en,p.summary_zh,p.summary_en,...p.tags_zh,...p.tags_en].join(' ').toLowerCase())}"><div class="writing-row-meta"><span class="post-kind">${kind(p)}</span><span>${t('约 '+minutes(p)+' 分钟',minutes(p)+' min read')}</span></div><div class="writing-row-body"><h3><a href="blog/${p.slug}.html">${esc(title(p))} <span aria-hidden="true">↗</span></a></h3><p>${esc(summary(p))}</p>${topics(p)}</div>${cover(p)?`<a class="writing-row-cover" href="blog/${p.slug}.html" aria-label="${esc(title(p))}">${thumb(p,depth,'writing-cover-image')}</a>`:''}</article>`;
  const filters=[['all',t('全部','All')],['notes',t('科研笔记','Research notes')],['reading',t('论文阅读','Paper reading')]].map(([key,label])=>`<button type="button" data-filter="${key}" aria-pressed="${key==='all'}">${label} <span class="filter-count">${key==='all'?posts.length:posts.filter(p=>p.kind===key).length}</span></button>`).join('');
  const html=`<!doctype html><html lang="${en?'en':'zh-CN'}" data-locale="${locale}">${pageHead()}<body class="theme-luka blog-page" data-page="blog" data-language-url="${en?'../blog.html':'en/blog.html'}"><a class="skip-link" href="#blog-main">${t('跳至正文','Skip to content')}</a>${nav(0)}<main class="blog-main" id="blog-main"><header class="blog-hero"><p class="blog-eyebrow">${t('研究与实践随记','NOTES ON RESEARCH & PRACTICE')}</p><h1 class="blog-title">Blog<span aria-hidden="true">.</span></h1><p class="blog-intro">${t('科研笔记与论文阅读。记录问题、方法，以及支撑结论的证据。','Research notes and paper readings. Questions, methods, and the evidence behind a conclusion.')}</p><p class="blog-byline"><span class="byline-rule" aria-hidden="true"></span>${t('王邻皓 / Linhao Wang','Linhao Wang / 王邻皓')}</p></header><a class="featured-writing featured-with-cover" href="blog/${first.slug}.html"><div><span class="featured-label">${t('置顶 · 论文与海报','PINNED · PAPER & POSTER')}</span><h2>${esc(title(first))}</h2><p>${esc(summary(first))}</p><span class="featured-link">${t('阅读文章与海报','Read the article & poster')} ↗</span></div>${thumb(first,depth,'featured-cover')}</a><section class="blog-articles"><div class="section-heading"><h2 class="section-title">${t('文章归档','Writing archive')}</h2><span class="section-index">${posts.length} ${t('篇笔记与阅读','NOTES & READINGS')}</span></div><div class="writing-controls"><div class="writing-filters" role="group" aria-label="${t('文章分类','Article categories')}">${filters}</div><label class="writing-search"><span aria-hidden="true">⌕</span><span class="sr-only">${t('搜索标题或主题','Search titles or topics')}</span><input type="search" id="writingSearch" placeholder="${t('搜索标题或主题','Search titles or topics')}" autocomplete="off"></label></div><p class="writing-count" aria-live="polite" id="writingCount"></p><div class="writing-list">${posts.map(row).join('')}</div><div class="search-empty" hidden><h3>${t('没有找到相关文章','No matching articles')}</h3><p>${t('试试其他关键词，或查看全部文章。','Try another term or view all writing.')}</p><button type="button" id="resetWriting">${t('查看全部','Show all')}</button></div></section><div class="blog-return"><a href="index.html">← ${t('返回个人主页','Back to homepage')}</a><a href="mailto:wanglinhao4140@gmail.com">${t('联系我','Get in touch')} ↗</a></div></main>${footer}<script src="${en?'../':''}assets/js/homepage.js"></script><script src="${en?'../':''}assets/js/blog.js"></script></body></html>`;
  await writeFile(`${dir}blog.html`,html);
 }
 console.log(`Built Chinese and English archives and ${posts.length*2} complete reading pages.`);
}
