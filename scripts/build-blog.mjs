import { renderBlogs } from './blog-pages.mjs';
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import MarkdownIt from 'markdown-it';
import katex from 'katex';

const home = await readFile('index.html', 'utf8');
const posts = JSON.parse(await readFile('data/posts.json', 'utf8'));
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bi = (zh, en) => `<span class="lang-zh">${esc(zh)}</span><span class="lang-en" lang="en">${esc(en)}</span>`;
const category = p => p.kind === 'reading' ? bi('论文精读','Paper reading') : bi('科研笔记','Research notes');
const header = home.match(/<nav class="top-nav"[\s\S]*?<\/div><\/div><\/nav>/)[0].replace('class="page-link" aria-current="page"','class="page-link"').replace('href="blog.html" class="page-link"','href="blog.html" class="page-link" aria-current="page"');
const footer = home.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0];
const head = (p, article=false) => {
 let html = home.match(/<head>[\s\S]*?<\/head>/)[0];
 html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(p ? p.title_zh+' · Linhao Wang' : 'Blog · 王邻皓 | Linhao Wang')}</title>`)
  .replace(/<meta name="description"[^>]+>/, `<meta name="description" content="${esc(p?.summary_zh || '王邻皓的科研笔记与论文阅读：医学 AI、智能体、验证与评价、数据工程。')}">`)
  .replace(/<meta property="og:title"[^>]+>/, `<meta property="og:title" content="${esc(p?.title_zh || 'Blog · Linhao Wang')}">`)
  .replace(/<meta property="og:description"[^>]+>/, `<meta property="og:description" content="${esc(p?.summary_zh || '科研笔记与论文精读')}">`)
  .replace('</head>', '<link rel="stylesheet" href="assets/css/blog.css"><link rel="stylesheet" href="assets/vendor/katex/katex.min.css"></head>');
 return article ? html.replaceAll('href="assets/','href="../assets/').replaceAll('src="assets/','src="../assets/') : html;
};
const md = new MarkdownIt({html:false,linkify:false,typographer:false});
function math(tex, display=false) { return katex.renderToString(tex, {displayMode:display,throwOnError:true,trust:false,strict:'ignore'}); }
md.inline.ruler.before('escape','math_inline',(state,silent)=>{
 const start=state.pos; if(!state.src.startsWith('\\(', start)) return false;
 const end=state.src.indexOf('\\)',start+2); if(end<0) return false;
 if(!silent) {const t=state.push('math_inline','math',0);t.content=state.src.slice(start+2,end);}
 state.pos=end+2; return true;
});
md.renderer.rules.math_inline=(tokens,i)=>math(tokens[i].content);
md.block.ruler.before('fence','math_block',(state,start,end,silent)=>{
 const first=state.src.slice(state.bMarks[start]+state.tShift[start],state.eMarks[start]).trim();
 if(first!=='\\[' && first!=='$$') return false;
 const close=first==='$$'?'$$':'\\]'; let last=start+1;
 while(last<end && state.src.slice(state.bMarks[last]+state.tShift[last],state.eMarks[last]).trim()!==close) last++;
 if(last===end)return false;if(silent)return true;
 const token=state.push('math_block','math',0);token.block=true;token.content=state.getLines(start+1,last,0,false);token.map=[start,last+1];state.line=last+1;return true;
});
md.renderer.rules.math_block=(tokens,i)=>`<div class="math-display">${math(tokens[i].content,true)}</div>\n`;
md.renderer.rules.table_open=(tokens,i,options,env)=>`<div class="table-scroll" tabindex="0" role="region" aria-label="${env.locale==='en'?'Horizontally scrollable table':'可横向滚动的表格'}"><table>`;
md.renderer.rules.table_close=()=>'</table></div>';
const linkOpen=md.renderer.rules.link_open||((tokens,i,options,env,self)=>self.renderToken(tokens,i,options));
md.renderer.rules.link_open=(tokens,i,options,env,self)=>{if(/^https?:/.test(tokens[i].attrGet('href')||'')){tokens[i].attrSet('target','_blank');tokens[i].attrSet('rel','noopener noreferrer');}return linkOpen(tokens,i,options,env,self);};
// A standalone image with a Markdown title becomes a figure with a visible caption.
md.core.ruler.push('captioned_figures',state=>{
 for(let i=0;i<state.tokens.length-2;i++){
  const [open,inline,close]=state.tokens.slice(i,i+3);
  if(open.type!=='paragraph_open'||inline.type!=='inline'||close.type!=='paragraph_close')continue;
  const children=inline.children?.filter(t=>t.type!=='text'||t.content.trim());
  if(children?.length!==1||children[0].type!=='image'||!children[0].attrGet('title'))continue;
  open.type='figure_open';open.tag='figure';open.attrSet('class','blog-figure');
  close.type='figure_close';close.tag='figure';children[0].meta={caption:true};
 }
});
md.renderer.rules.image=(tokens,i,options,env)=>{const t=tokens[i];let src=t.attrGet('src');if(env.locale==='en'&&src.startsWith('../assets/'))src='../'+src;const caption=t.meta?.caption?`<figcaption>${esc(t.attrGet('title'))}</figcaption>`:'';return `<a class="article-figure" href="${esc(src)}" target="_blank" rel="noopener noreferrer" title="${env.locale==='en'?'View full-size figure':'查看原图'}"><img src="${esc(src)}" alt="${esc(t.content)}" loading="lazy" decoding="async"></a>${caption}`;};

await mkdir('assets/vendor/katex',{recursive:true});
await cp('node_modules/katex/dist/katex.min.css','assets/vendor/katex/katex.min.css');
await cp('node_modules/katex/dist/fonts','assets/vendor/katex/fonts',{recursive:true});
await cp('node_modules/katex/LICENSE','assets/vendor/katex/LICENSE');
await renderBlogs({md,home,posts,esc,bi,header,footer,head});
