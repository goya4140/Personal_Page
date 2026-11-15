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
  const articleUrl = `https://goya4140.github.io/${english ? 'en/' : ''}blog/${articleId}/`;
  const quoteLimit = 480;
  const bodyLimit = 600;
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
  const openButton = document.createElement('button');
  openButton.type = 'button';
  openButton.className = 'reading-comments-open';
  openButton.setAttribute('aria-haspopup', 'dialog');
  tools.append(openButton);
  article.before(tools);

  const bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.className = 'reading-comment-action';
  bubble.textContent = t('写批注', 'Add note');
  bubble.setAttribute('aria-haspopup', 'dialog');
  bubble.hidden = true;
  document.body.append(bubble);

  const dialog = document.createElement('dialog');
  dialog.className = 'reading-comment-dialog';
  dialog.setAttribute('aria-labelledby', 'reading-comment-title');
  dialog.innerHTML = `
    <header><h2 id="reading-comment-title"></h2><button type="button" class="reading-comment-close" aria-label="${t('关闭批注', 'Close notes')}">×</button></header>
    <p class="reading-comment-local">${t('批注与回复公开显示，以 GitHub 账号署名。', 'Notes and replies are public and attributed to GitHub accounts.')}</p>
    <div class="reading-comment-status" role="status" hidden></div>
    <nav class="reading-comment-controls reading-comment-navigation">
      <button type="button" class="reading-comment-refresh">${t('刷新', 'Refresh')}</button>
      <a class="reading-comment-on-github" target="_blank" rel="noopener">${t('在 GitHub 查看', 'View on GitHub')} ↗</a>
    </nav>
    <div class="reading-comment-list"></div>
    <form hidden>
      <blockquote></blockquote>
      <label for="reading-comment-text">${t('批注内容', 'Note')}</label>
      <textarea id="reading-comment-text" rows="4" maxlength="${bodyLimit}" required></textarea>
      <div class="reading-comment-controls">
        <button type="button" class="reading-comment-back">${t('取消', 'Cancel')}</button>
        <button type="submit" class="reading-comment-primary">${t('去 GitHub 发布', 'Publish on GitHub')}</button>
      </div>
    </form>`;
  document.body.append(dialog);

  const title = dialog.querySelector('h2');
  const list = dialog.querySelector('.reading-comment-list');
  const form = dialog.querySelector('form');
  const input = dialog.querySelector('textarea');
  const status = dialog.querySelector('.reading-comment-status');
  const navigation = dialog.querySelector('.reading-comment-navigation');
  dialog.querySelector('.reading-comment-on-github').href = issueListUrl;
  const closeButton = dialog.querySelector('.reading-comment-close');
  const supportsHighlight = typeof Highlight === 'function' && !!window.CSS?.highlights;
  let notes = [];
  let ranges = new Map();
  let pending = null;
  let composing = null;
  let returnFocus = null;
  let scheduled = false;
  let loadState = 'loading';
  let loadPromise;
  let listView = null;

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

  function encodeAnchor(anchor) {
    return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(anchor))));
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
      .finally(() => { loadPromise = null; renderList(); });
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
    openButton.textContent = `${t('公开批注', 'Public notes')} · ${notes.length}`;
  }

  function activeSelection() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    if (!article.contains(range.startContainer) || !article.contains(range.endContainer)) return null;
    const selected = range.toString();
    const quote = selected.trim();
    if (!quote || quote.length > quoteLimit) return null;
    const prefix = document.createRange();
    prefix.selectNodeContents(article);
    prefix.setEnd(range.startContainer, range.startOffset);
    const start = prefix.toString().length + selected.indexOf(quote);
    const end = start + quote.length;
    if (text.slice(start, end) !== quote) return null;
    const rects = range.getClientRects();
    const rect = rects[rects.length - 1];
    if (!rect?.width || rect.bottom < 0 || rect.top > innerHeight) return null;
    return {
      rect,
      quote,
      before: text.slice(Math.max(0, start - contextSize), start),
      after: text.slice(end, end + contextSize),
    };
  }

  function positionBubble() {
    scheduled = false;
    pending = dialog.open ? null : activeSelection();
    bubble.hidden = !pending;
    if (!pending) return;
    const { rect } = pending;
    const width = bubble.offsetWidth;
    bubble.style.left = Math.max(12, Math.min(rect.right - width / 2, innerWidth - width - 12)) + 'px';
    bubble.style.top = (rect.bottom + bubble.offsetHeight + 12 < innerHeight
      ? rect.bottom + 8 : Math.max(8, rect.top - bubble.offsetHeight - 8)) + 'px';
  }

  function queuePosition() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(positionBubble);
  }

  function openDialog(trigger) {
    if (dialog.open) return;
    returnFocus = trigger === bubble ? openButton : trigger;
    bubble.hidden = true;
    dialog.showModal();
  }

  function compose(note, trigger) {
    listView = null;
    composing = note;
    title.textContent = t('写公开批注', 'Write a public note');
    navigation.hidden = true;
    list.hidden = true;
    form.hidden = false;
    form.querySelector('blockquote').textContent = note.quote;
    input.value = '';
    announce(t('下一步会打开 GitHub，请在那里提交。', 'The next step opens GitHub for you to submit.'));
    openDialog(trigger);
    input.focus();
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
    if (!listView) return;
    const { firstId, notice } = listView;
    const messages = {
      loading: t('正在读取 GitHub 批注…', 'Loading notes from GitHub…'),
      error: t('暂时无法读取批注，请刷新或在 GitHub 查看。', 'Could not load notes. Refresh or view them on GitHub.'),
      ready: '',
    };
    announce([notice, messages[loadState]].filter(Boolean).join(' '));
    if (loadState === 'loading' && list.childElementCount) return;
    list.replaceChildren();
    if (loadState === 'ready' && !notes.length) {
      const hint = document.createElement('p');
      hint.textContent = t('选中正文中的词句，即可写下第一条公开批注。', 'Select text in the article to write the first public note.');
      list.append(hint);
    }
    const ordered = firstId ? [...notes].sort((a, b) => Number(b.id === firstId) - Number(a.id === firstId)) : notes;
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
      if (firstId === note.id) replies.open = true;
    }
  }

  function showList(trigger, firstId, notice = '') {
    composing = null;
    listView = { firstId, notice };
    title.textContent = t('公开批注', 'Public notes');
    form.hidden = true;
    navigation.hidden = false;
    list.hidden = false;
    renderList();
    openDialog(trigger);
    closeButton.focus();
  }

  function createFromSelection(selection, trigger) {
    const { quote, before, after } = selection;
    compose({ quote, before, after }, trigger);
    window.getSelection()?.removeAllRanges();
  }

  // Keep the quote selected while the user clicks the selection action.
  bubble.addEventListener('mousedown', event => event.preventDefault());
  bubble.addEventListener('click', () => {
    const selection = pending ?? activeSelection();
    if (selection) createFromSelection(selection, bubble);
  });
  openButton.addEventListener('click', () => showList(openButton));
  closeButton.addEventListener('click', () => dialog.close());
  dialog.querySelector('.reading-comment-back').addEventListener('click', () => showList(openButton));
  dialog.querySelector('.reading-comment-refresh').addEventListener('click', () => refresh());
  dialog.addEventListener('close', () => {
    pending = null;
    composing = null;
    listView = null;
    returnFocus?.focus({ preventScroll: true });
    queuePosition();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const note = input.value.trim();
    if (!composing || !note) {
      announce(t('请填写批注内容。', 'Enter a note before publishing.'));
      return;
    }
    if (note.includes(quoteDivider)) {
      announce(t('请移除批注中的保留标记。', 'Remove the reserved marker from your note.'));
      return;
    }
    const anchor = { article: articleId, locale, ...composing };
    const excerpt = Array.from(composing.quote).slice(0, 48).join('').replace(/\s+/g, ' ');
    const quote = composing.quote.split(/\r?\n/).map(line => '> ' + line).join('\n');
    const body = `<!-- blog-note:v1:${encodeAnchor(anchor)} -->\n\n${note}\n\n${quoteDivider}\n\n${quote}\n\n[Article](${articleUrl})`;
    const url = github + '/issues/new?' + new URLSearchParams({ title: issuePrefix + ' · ' + excerpt, body });
    if (url.length > 7500) {
      announce(t('选区和批注合起来太长，请缩短批注。', 'The selection and note are too long together. Shorten the note.'));
      return;
    }
    const link = externalLink('', url);
    form.append(link);
    link.click();
    link.remove();
    showList(openButton, undefined, t('在 GitHub 提交后，回到这里点「刷新」。', 'After submitting on GitHub, return here and choose Refresh.'));
  });
  article.addEventListener('click', event => {
    if (!supportsHighlight || !event.detail || event.target.closest('a,button,input,summary')
      || !window.getSelection()?.isCollapsed) return;
    for (const [id, range] of ranges) {
      if ([...range.getClientRects()].some(r =>
        event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom)) {
        showList(openButton, id);
        break;
      }
    }
  });
  document.addEventListener('selectionchange', queuePosition);
  window.addEventListener('scroll', queuePosition, { passive: true });
  window.addEventListener('resize', queuePosition);
  window.addEventListener('focus', () => {
    if (dialog.open && listView) refresh();
  });
  updateHighlights();
  refresh();
})();
