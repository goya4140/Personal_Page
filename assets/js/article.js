(() => {
 const progress=document.querySelector('.reading-progress');
 const article=document.querySelector('.article-prose');
 let scheduled=false;
 function update(){const top=article.getBoundingClientRect().top+scrollY;const total=Math.max(1,article.offsetHeight-innerHeight+100);progress.style.width=Math.max(0,Math.min(100,(scrollY-top+100)/total*100))+'%';scheduled=false;}
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
 addEventListener('resize',update);update();
 const headings=[...article.querySelectorAll('h2')];
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){document.querySelectorAll('.article-toc a[href^="#"]').forEach(link=>{const active=link.hash==='#'+entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}},{rootMargin:'-12% 0px -68% 0px'});headings.forEach(h=>observer.observe(h));}

 const triggers=[...article.querySelectorAll('.reading-note-trigger')];
 if(!triggers.length)return;
 const panels=[...document.querySelectorAll('.reading-note-panel')];
 // Keep native click fallback in HTML, but let one controller own enhanced events.
 triggers.forEach(trigger=>trigger.removeAttribute('popovertarget'));
 panels.forEach(panel=>{panel.removeAttribute('popover');panel.hidden=true;panel.querySelector('.reading-note-close').removeAttribute('popovertarget');});
 let current=null,pinned=false,leaveTimer,hoverTimer;
 function position(){
  if(!current)return;
  const {trigger,panel}=current,r=trigger.getBoundingClientRect();
  if(innerWidth<=560){
   panel.style.maxHeight=Math.max(80,Math.min(620,innerHeight-108))+'px';
   panel.style.top=Math.max(82,innerHeight-panel.offsetHeight-12)+'px';
   panel.style.left='12px';return;
  }
  panel.style.maxHeight=Math.max(80,Math.min(560,innerHeight-108))+'px';
  const below=innerHeight-r.bottom-12,above=r.top-84;
  const placeBelow=below>=panel.offsetHeight+10||(above<panel.offsetHeight+10&&below>=above);
  panel.style.maxHeight=Math.max(80,Math.min(560,placeBelow?below-10:above-10))+'px';
  const height=panel.offsetHeight,width=panel.offsetWidth;
  const top=placeBelow?r.bottom+10:r.top-height-10;
  panel.style.top=Math.max(82,Math.min(top,innerHeight-height-12))+'px';
  panel.style.left=Math.max(12,Math.min(r.left,innerWidth-width-12))+'px';
 }
 function close(restoreFocus=false){
  clearTimeout(leaveTimer);clearTimeout(hoverTimer);
  if(!current)return;
  const {trigger,panel}=current;current=null;pinned=false;
  panel.hidden=true;
  trigger.setAttribute('aria-expanded','false');
  if(restoreFocus)trigger.focus({preventScroll:true});
 }
 function open(trigger,pin=false){
  clearTimeout(leaveTimer);
  const panel=document.getElementById(trigger.getAttribute('aria-controls'));
  if(current?.trigger!==trigger){
   close();current={trigger,panel};pinned=pin;
   panel.hidden=false;
   pinned=pin;
   trigger.setAttribute('aria-expanded','true');
  }else if(pin)pinned=true;
  position();requestAnimationFrame(position);
 }
 function delayClose(){
  clearTimeout(leaveTimer);clearTimeout(hoverTimer);
  leaveTimer=setTimeout(()=>{if(!pinned&&current&&!current.panel.contains(document.activeElement))close();},240);
 }
 for(const trigger of triggers){
  trigger.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&matchMedia('(hover: hover)').matches)hoverTimer=setTimeout(()=>open(trigger),140);});
  trigger.addEventListener('pointerleave',delayClose);
  trigger.addEventListener('click',event=>{
   event.preventDefault();
   if(current?.trigger===trigger&&pinned)close();
   else{open(trigger,true);current.panel.querySelector('.reading-note-close').focus({preventScroll:true});}
  });
 }
 for(const panel of panels){
  panel.addEventListener('pointerenter',()=>clearTimeout(leaveTimer));
  panel.addEventListener('pointerleave',delayClose);
  panel.addEventListener('focusin',event=>{if(event.target!==panel)pinned=true;clearTimeout(leaveTimer);});
  panel.querySelector('.reading-note-close').addEventListener('click',event=>{event.preventDefault();close(true);});
  panel.querySelector('details').addEventListener('toggle',position);
 }
 document.addEventListener('pointerdown',event=>{if(current&&!current.panel.contains(event.target)&&!current.trigger.contains(event.target))close();});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&current){event.preventDefault();close(true);}
  if(event.key==='Tab'&&current)requestAnimationFrame(()=>{if(current&&!current.panel.contains(document.activeElement)&&document.activeElement!==current.trigger)close();});
 });
 addEventListener('resize',position);
 addEventListener('scroll',()=>{if(pinned)position();else close();},{passive:true});
})();
