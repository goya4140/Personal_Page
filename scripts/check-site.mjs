import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import MarkdownIt from 'markdown-it';
const root=path.resolve('dist'),md=new MarkdownIt();
const posts=JSON.parse(fs.readFileSync('data/posts.json'));
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
let references=0;
for(const file of walk(root).filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(file,'utf8');
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const value=match[1].replaceAll('&amp;','&');
  if(!value||/^(?:https?:|mailto:|data:|javascript:)/.test(value))continue;
  const [part,fragment]=value.split('#');let target=path.resolve(path.dirname(file),decodeURIComponent(part.split('?')[0]||path.basename(file)));
  assert(target===root||target.startsWith(root+path.sep),`Nonportable path in ${file}: ${value}`);
  assert(fs.existsSync(target),`Missing local target in ${file}: ${value}`);
  if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(fragment&&target.endsWith('.html'))assert(fs.readFileSync(target,'utf8').includes(`id="${fragment}"`),`Missing anchor: ${file}: ${value}`);
  references++;
 }
}
const structure=s=>md.parse(s,{}).filter(t=>['heading_open','tr_open','image'].includes(t.type)).map(t=>t.type+(t.type==='heading_open'?t.tag:''));
const urls=s=>[...s.matchAll(/\]\((https?:\/\/[^\s)]+)/g)].map(m=>m[1]).sort();
const numbersInTables=s=>{let inside=false;const cells=[];for(const t of md.parse(s,{})){if(t.type==='table_open')inside=true;if(t.type==='table_close')inside=false;if(inside&&t.type==='inline')cells.push((t.content.match(/\d+(?:[.,]\d+)*%?/g)||[]).sort());}return cells;};
for(const p of posts){
 const zh=fs.readFileSync(`content/posts/${p.slug}.md`,'utf8'),en=fs.readFileSync(`content/posts/en/${p.slug}.md`,'utf8');
 assert.deepEqual(structure(zh),structure(en),`Translated heading/table structure: ${p.slug}`);
 assert.deepEqual(urls(zh),urls(en),`Translated source links: ${p.slug}`);
 assert.deepEqual(numbersInTables(zh),numbersInTables(en),`Translated table numbers: ${p.slug}`);
 assert(!/[\u3400-\u9fff]/u.test(en),`Untranslated Chinese in ${p.slug}`);
 for(const [prefix,language] of [['','zh-CN'],['en/','en']]){
  const html=fs.readFileSync(`dist/${prefix}blog/${p.slug}/index.html`,'utf8');
  assert(html.includes(`<article class="article-prose" id="article-content" lang="${language}">`));
 }
}
console.log(`Checked ${posts.length} translation pairs, table numbers, source links, and ${references} local references.`);
