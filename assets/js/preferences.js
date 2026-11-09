(() => {
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const theme = read('linhao-theme');
  document.documentElement.dataset.theme = theme === 'light' || theme === 'dark' ? theme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.lang = document.documentElement.dataset.locale === 'en' ? 'en' : 'zh-CN';
})();
