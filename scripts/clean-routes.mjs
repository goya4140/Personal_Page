import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Keep the authoring renderer unchanged; publish directory URLs with rebased links.
const posts=JSON.parse(await readFile('data/posts.json','utf8'));
const routes=new Map([['index.html',''],['en/index.html','en/'],['blog.html','blog/'],['en/blog.html','en/blog/']]);
for(const p of posts)for(const prefix of ['','en/'])routes.set(`${prefix}blog/${p.slug}.html`,`${prefix}blog/${p.slug}/`);
const documents=await Promise.all([...routes].map(async([file,url])=>({file,url,html:await readFile(file,'utf8')})));
const escape=s=>s.replace(/[&"<>]/g,c=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[c]));
function rebase(value,source,destination){
 if(!value||value.startsWith('#')||value.startsWith('?')||/^(?:[a-z]+:|\/\/)/i.test(value))return value;
 const target=new URL(value.replaceAll('&amp;','&'),`https://static.invalid/${source}`);
 const targetPath=target.pathname.slice(1),mapped=routes.has(targetPath)?routes.get(targetPath):targetPath;
 let relative=path.posix.relative(path.posix.dirname(destination),mapped)||'.';
 if((mapped===''||mapped.endsWith('/'))&&!relative.endsWith('/'))relative+='/';
 return relative+target.search+target.hash;
}
for(const {file,url,html} of documents){
 const destination=url+'index.html';
 const clean=html.replace(/\b(href|src|data-language-url)="([^"]*)"/g,(_,name,value)=>`${name}="${escape(rebase(value,file,destination))}"`);
 await mkdir(path.posix.dirname(destination),{recursive:true});
 await writeFile(destination,clean);
 if(file!==destination){
  const target=path.posix.relative(path.posix.dirname(file),url)||'.';
  const href=target.endsWith('/')?target:target+'/';
  const script=`const target=new URL(${JSON.stringify(href)},location.href);target.search=location.search;target.hash=location.hash;location.replace(target.href);`;
  await writeFile(file,`<!doctype html><html><head><meta charset="utf-8"><title>Page moved</title><script>${script}</script></head><body><a href="${href}">Continue to the page</a></body></html>\n`);
 }
}
console.log(`Published ${routes.size} clean directory routes with legacy redirects.`);
