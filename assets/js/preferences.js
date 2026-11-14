(() => {
  const canonical=new URL(location.href);
  if(canonical.hostname==='goya4140.github.io'&&canonical.pathname.startsWith('/Personal_Page/'))canonical.pathname=canonical.pathname.slice('/Personal_Page'.length);
  if(canonical.pathname.endsWith('/index.html'))canonical.pathname=canonical.pathname.slice(0,-'index.html'.length);
  if(canonical.href!==location.href)location.replace(canonical.href);
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const theme = read('linhao-theme');
  document.documentElement.dataset.theme = theme === 'light' || theme === 'dark' ? theme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.lang = document.documentElement.dataset.locale === 'en' ? 'en' : 'zh-CN';
})();
