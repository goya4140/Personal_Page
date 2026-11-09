(() => {
 const progress=document.querySelector('.reading-progress');
 const article=document.querySelector('.article-prose');
 let scheduled=false;
 function update(){const top=article.getBoundingClientRect().top+scrollY;const total=Math.max(1,article.offsetHeight-innerHeight+100);progress.style.width=Math.max(0,Math.min(100,(scrollY-top+100)/total*100))+'%';scheduled=false;}
 addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
 addEventListener('resize',update);update();
 const headings=[...article.querySelectorAll('h2')];
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){document.querySelectorAll('.article-toc a[href^="#"]').forEach(link=>{const active=link.hash==='#'+entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}},{rootMargin:'-12% 0px -68% 0px'});headings.forEach(h=>observer.observe(h));}
})();
