(() => {
 const rows=[...document.querySelectorAll('.writing-row')];
 const input=document.getElementById('writingSearch');
 const buttons=[...document.querySelectorAll('[data-filter]')];
 const count=document.getElementById('writingCount');
 const empty=document.querySelector('.search-empty');
 const params=new URLSearchParams(location.search);
 let filter=['all','notes','reading'].includes(params.get('category'))?params.get('category'):'all';
 input.value=params.get('q')||'';
 function update(syncUrl=true){
  const terms=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);let total=0;
  rows.forEach(row=>{const show=(filter==='all'||row.dataset.kind===filter)&&terms.every(t=>row.dataset.search.includes(t));row.hidden=!show;if(show)total++;});
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter)));
  empty.hidden=total!==0;
  const en=document.documentElement.lang==='en';
  count.textContent=en?`${total} of ${rows.length} articles`:`显示 ${total} / ${rows.length} 篇文章`;
  input.placeholder=en?'Search titles or topics':'搜索标题或主题';
  if(syncUrl){const url=new URL(location.href);filter==='all'?url.searchParams.delete('category'):url.searchParams.set('category',filter);input.value.trim()?url.searchParams.set('q',input.value.trim()):url.searchParams.delete('q');history.replaceState(null,'',url.pathname+url.search+url.hash);}
 }
 buttons.forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;update();}));
 input.addEventListener('input',()=>update());
 document.getElementById('resetWriting').addEventListener('click',()=>{filter='all';input.value='';update();input.focus();});
 new MutationObserver(()=>update(false)).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 update(false);
})();
