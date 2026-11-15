(() => {
  const article = document.querySelector('[data-article-id]');
  if (!article || !window.HTMLDialogElement?.prototype.showModal) return;

  const english = document.documentElement.dataset.locale === 'en';
  const t = (zh, en) => english ? en : zh;
  const repo = 'goya4140/goya4140.github.io';
  const github = 'https://github.com/' + repo;
  const api = 'https://api.github.com/repos/' + repo;
  const locale = english ? 'en' : 'zh';
  const articleId = article.dataset.articleId;
  const issuePrefix = `Blog note: ${articleId}/${locale}`;
  const quoteLimit = 480;
  const contextSize = 40;
  const marker = /^<!-- blog-note:v1:([A-Za-z0-9+/=]+) -->\r?\n/;
  const quoteDivider = '<!-- blog-note:source -->';
  const issueListUrl = github + '/issues?' + new URLSearchParams({q: `is:issue is:open in:title "${issuePrefix}"`});
  const text = article.textContent;
  const textNodes = [];
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  let node;
  let offset = 0;
  while ((node = walker.nextNode())) {
    if (node.length) textNodes.push({ node, start: offset, end: offset + node.length });
    offset += node.length;
  }

  const tools = document.createElement('div');
  tools.className = 'reading-comments-tools';
  tools.hidden = true;
  const openButton = document.createElement('button');
  openButton.type = 'button';
  openButton.className = 'reading-comments-open';
  openButton.setAttribute('aria-haspopup', 'dialog');
  tools.append(openButton);
  article.before(tools);

  const dialog = document.createElement('dialog');
  dialog.className = 'reading-comment-dialog';
  dialog.setAttribute('aria-labelledby', 'reading-comment-title');
  dialog.innerHTML = `
    <header><h2 id="reading-comment-title"></h2><button type="button" class="reading-comment-close" aria-label="${t('关闭批注', 'Close notes')}">×</button></header>
    <p class="reading-comment-local">${t('这里显示最初通过 GitHub 发布的批注及回复。', 'These notes and replies were posted through GitHub.')}</p>
    <div class="reading-comment-status" role="status" hidden></div>
    <nav class="reading-comment-controls reading-comment-navigation">
      <button type="button" class="reading-comment-refresh">${t('刷新', 'Refresh')}</button>
      <a class="reading-comment-on-github" target="_blank" rel="noopener">${t('在 GitHub 查看', 'View on GitHub')} ↗</a>
    </nav>
    <div class="reading-comment-list"></div>`;
  document.body.append(dialog);

  const title = dialog.querySelector('h2');
  const list = dialog.querySelector('.reading-comment-list');
  const status = dialog.querySelector('.reading-comment-status');
  dialog.querySelector('.reading-comment-on-github').href = issueListUrl;
  const closeButton = dialog.querySelector('.reading-comment-close');
  const supportsHighlight = typeof Highlight === 'function' && !!window.CSS?.highlights;
  let notes = [];
  let ranges = new Map();
  let loadState = 'loading';
  let loadPromise;
  let focusedNoteId;

  function announce(message = '') {
    status.textContent = message;
    status.hidden = !message;
  }

  async function readPages(path, query = {}) {
    const rows = [];
    for (let page = 1; ; page++) {
      const params = new URLSearchParams({ ...query, per_page: '100', page: String(page) });
      const response = await fetch(api + path + '?' + params, {
        credentials: 'omit',
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!response.ok) throw new Error('GitHub HTTP ' + response.status);
      const batch = await response.json();
      if (!Array.isArray(batch)) throw new Error('Unexpected response');
      rows.push(...batch);
      if (!(response.headers.get('Link')?.includes('rel="next"') || batch.length === 100)) return rows;
    }
  }

  function parseIssue(issue) {
    if (!Number.isSafeInteger(issue.number) || issue.pull_request ||
        !issue.title?.startsWith(issuePrefix + ' · ') || typeof issue.body !== 'string') return null;
    const match = issue.body.match(marker);
    const stop = issue.body.lastIndexOf(quoteDivider);
    if (!match || match[1].length > 4096 || stop < match[0].length) return null;
    try {
      const anchor = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(match[1]), c => c.charCodeAt(0))));
      if (anchor.article !== articleId || anchor.locale !== locale ||
          typeof anchor.quote !== 'string' || !anchor.quote.trim() || anchor.quote.length > quoteLimit ||
          typeof anchor.before !== 'string' || anchor.before.length > contextSize ||
          typeof anchor.after !== 'string' || anchor.after.length > contextSize) return null;
      return { ...anchor, id: issue.number, body: issue.body.slice(match[0].length, stop).trim(),
        user: issue.user?.login, replies: issue.comments };
    } catch {
      return null;
    }
  }

  function refresh() {
    if (loadPromise) return loadPromise;
    loadState = 'loading';
    renderList();
    loadPromise = readPages('/issues', { state: 'open', sort: 'created', direction: 'desc' })
      .then(rows => {
        notes = rows.map(parseIssue).filter(Boolean);
        loadState = 'ready';
        updateHighlights();
      })
      .catch(() => { loadState = 'error'; })
      .finally(() => {
        loadPromise = null;
        tools.hidden = loadState === 'ready' && !notes.length;
        renderList();
      });
    return loadPromise;
  }

  function findRange(note) {
    let best = -1;
    let bestScore = -1;
    let tied = false;
    for (let index = text.indexOf(note.quote); index !== -1; index = text.indexOf(note.quote, index + 1)) {
      const end = index + note.quote.length;
      const left = text.slice(Math.max(0, index - contextSize), index);
      const right = text.slice(end, end + contextSize);
      let score = 0;
      for (let i = 1; i <= Math.min(left.length, note.before.length) && left.at(-i) === note.before.at(-i); i++) score++;
      for (let i = 0; i < Math.min(right.length, note.after.length) && right[i] === note.after[i]; i++) score++;
      if (score > bestScore) {
        best = index;
        bestScore = score;
        tied = false;
      } else if (score === bestScore) {
        tied = true;
      }
    }
    if (best < 0 || tied) return null;
    const end = best + note.quote.length;
    const startPart = textNodes.find(part => part.end > best);
    const endPart = textNodes.find(part => part.end >= end);
    if (!startPart || !endPart) return null;
    const range = document.createRange();
    range.setStart(startPart.node, best - startPart.start);
    range.setEnd(endPart.node, end - endPart.start);
    return range;
  }

  function updateHighlights() {
    ranges = new Map();
    for (const note of notes) {
      const range = findRange(note);
      if (range) ranges.set(note.id, range);
    }
    if (supportsHighlight) {
      CSS.highlights.set('blog-reading-comment', new Highlight(...ranges.values()));
    }
    openButton.textContent = `${t('GitHub 批注', 'GitHub notes')}${notes.length ? ' · ' + notes.length : ''}`;
  }

  function goToQuote(note) {
    const range = ranges.get(note.id);
    if (!range) return;
    dialog.close();
    range.startContainer.parentElement.scrollIntoView({ block: 'center' });
    if (!supportsHighlight) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  function action(label, callback) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', callback);
    return button;
  }

  function externalLink(label, href) {
    const link = document.createElement('a');
    link.textContent = label;
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener';
    return link;
  }

  function author(login) {
    return typeof login === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9-]*(?:\[bot\])?$/.test(login)
      ? externalLink('@' + login, 'https://github.com/' + encodeURIComponent(login))
      : document.createTextNode(t('GitHub 用户', 'GitHub user'));
  }

  function commentText(body) {
    const paragraph = document.createElement('p');
    paragraph.className = 'reading-comment-body';
    paragraph.textContent = typeof body === 'string' ? body : '';
    return paragraph;
  }

  async function showReplies(note, entries) {
    entries.textContent = t('正在读取回复…', 'Loading replies…');
    try {
      const replies = await readPages('/issues/' + note.id + '/comments');
      if (!entries.isConnected) return;
      entries.replaceChildren();
      for (const item of replies) {
        const message = document.createElement('div');
        message.className = 'reading-comment-reply';
        message.append(author(item.user?.login), commentText(item.body));
        entries.append(message);
      }
      if (!replies.length) entries.textContent = t('还没有回复。', 'No replies yet.');
    } catch {
      entries.textContent = t('暂时无法读取回复，可在 GitHub 上查看。', 'Replies are unavailable here. Open GitHub to see them.');
    }
  }

  function renderList() {
    if (!dialog.open) return;
    const messages = {
      loading: t('正在读取 GitHub 批注…', 'Loading notes from GitHub…'),
      error: t('暂时无法读取批注，请刷新或在 GitHub 查看。', 'Could not load notes. Refresh or view them on GitHub.'),
      ready: '',
    };
    announce(messages[loadState]);
    if (loadState === 'loading' && list.childElementCount) return;
    list.replaceChildren();
    if (loadState === 'ready' && !notes.length) {
      const hint = document.createElement('p');
      hint.textContent = t('当前没有通过 GitHub 发布的批注。', 'There are no notes posted through GitHub.');
      list.append(hint);
    }
    const ordered = focusedNoteId ? [...notes].sort((a, b) => Number(b.id === focusedNoteId) - Number(a.id === focusedNoteId)) : notes;
    for (const note of ordered) {
      const card = document.createElement('section');
      card.className = 'reading-comment-card';
      const quote = document.createElement('blockquote');
      quote.textContent = note.quote;
      const byline = document.createElement('p');
      byline.className = 'reading-comment-byline';
      byline.append(author(note.user));
      const buttons = document.createElement('div');
      buttons.className = 'reading-comment-controls';
      const located = ranges.has(note.id);
      const jump = action(located ? t('定位原文', 'Go to text') : t('原文位置未找到', 'Text not found'), () => goToQuote(note));
      jump.disabled = !located;
      buttons.append(jump, externalLink(t('在 GitHub 回复', 'Reply on GitHub') + ' ↗', github + '/issues/' + note.id + '#new_comment_field'));
      const replies = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = t('查看回复', 'Read replies') + ` (${note.replies || 0})`;
      const entries = document.createElement('div');
      replies.append(summary, entries);
      replies.addEventListener('toggle', () => {
        if (replies.open) showReplies(note, entries);
      });
      card.append(quote, byline, commentText(note.body), buttons, replies);
      list.append(card);
      if (focusedNoteId === note.id) replies.open = true;
    }
  }

  function showList(noteId) {
    focusedNoteId = noteId;
    title.textContent = t('GitHub 批注', 'GitHub notes');
    if (!dialog.open) dialog.showModal();
    renderList();
    closeButton.focus();
  }

  openButton.addEventListener('click', () => showList());
  closeButton.addEventListener('click', () => dialog.close());
  dialog.querySelector('.reading-comment-refresh').addEventListener('click', () => refresh());
  dialog.addEventListener('close', () => openButton.focus({ preventScroll: true }));
  article.addEventListener('click', event => {
    if (!supportsHighlight || !event.detail || event.target.closest('a,button,input,summary')
      || !window.getSelection()?.isCollapsed) return;
    for (const [id, range] of ranges) {
      if ([...range.getClientRects()].some(r =>
        event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom)) {
        showList(id);
        break;
      }
    }
  });
  updateHighlights();
  refresh();
})();
