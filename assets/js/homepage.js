(() => {
  const root = document.documentElement;
  const language = document.getElementById('languageToggle');
  const theme = document.getElementById('themeToggle');
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  function labels() {
    const en = root.lang === 'en';
    const dark = root.dataset.theme === 'dark';
    language.textContent = en ? '中文' : 'EN';
    language.setAttribute('aria-label', en ? '切换为中文' : 'Switch to English');
    theme.setAttribute('aria-pressed', String(dark));
    theme.setAttribute('aria-label', en ? (dark ? 'Switch to light mode' : 'Switch to dark mode') : (dark ? '切换浅色模式' : '切换深色模式'));
    document.title = document.body.dataset.page === 'article' ? ((en ? document.body.dataset.titleEn : document.body.dataset.titleZh) + ' | Linhao Wang') : document.body.dataset.page === 'blog' ? (en ? 'Blog | Linhao Wang' : 'Blog · 王邻皓') : (en ? 'Linhao Wang | Scientific Agents & Research Automation' : '王邻皓 · Linhao Wang | 科研智能体与科研自动化');
  }
  language.addEventListener('click', () => {
    write('linhao-language', root.lang === 'en' ? 'zh-CN' : 'en');
    const target = new URL(document.body.dataset.languageUrl, location.href);
    target.search = location.search;
    target.hash = location.hash;
    location.assign(target.href);
  });
  theme.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; write('linhao-theme', root.dataset.theme); labels(); });
  labels();
  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.section-nav a')];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        links.forEach(link => { const active = link.hash === '#' + entry.target.id; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
      }
    }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
    document.querySelectorAll('main .section').forEach(section => observer.observe(section));
  }
})();

// Native dialog provides focus containment, Escape dismissal and focus restoration.
(() => {
  const dialog = document.getElementById('figureDialog');
  if (!dialog) return;
  const image = document.getElementById('figureDialogImage');
  const title = document.getElementById('figureDialogTitle');
  document.querySelectorAll('.paper-figure').forEach(button => {
    button.addEventListener('click', () => {
      const thumbnail = button.querySelector('img');
      image.src = thumbnail.getAttribute('src');
      image.alt = thumbnail.alt;
      title.textContent = button.dataset.paper;
      dialog.showModal();
    });
  });
  dialog.querySelector('.figure-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
})();
