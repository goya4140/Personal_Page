(() => {
  const article = document.querySelector('[data-article-id]');
  if (!article || !window.HTMLDialogElement?.prototype.showModal) return;

  const english = document.documentElement.dataset.locale === 'en';
  const t = (zh, en) => english ? en : zh;
  const key = `blog:reading-comments:v1:${article.dataset.articleId}:${english ? 'en' : 'zh'}`;
  const limit = 1200;
  const contextSize = 48;
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
    <p class="reading-comment-local">${t('批注仅保存在当前浏览器。', 'Notes are saved in this browser.')}</p>
    <div class="reading-comment-error" role="alert" hidden></div>
    <div class="reading-comment-list"></div>
    <form hidden>
      <blockquote></blockquote>
      <label for="reading-comment-text">${t('批注内容', 'Note')}</label>
      <textarea id="reading-comment-text" rows="4" maxlength="${limit}" required></textarea>
      <div class="reading-comment-controls">
        <button type="button" class="reading-comment-back">${t('取消', 'Cancel')}</button>
        <button type="submit" class="reading-comment-primary">${t('保存批注', 'Save note')}</button>
      </div>
    </form>`;
  document.body.append(dialog);

  const title = dialog.querySelector('h2');
  const list = dialog.querySelector('.reading-comment-list');
  const form = dialog.querySelector('form');
  const input = dialog.querySelector('textarea');
  const error = dialog.querySelector('.reading-comment-error');
  const closeButton = dialog.querySelector('.reading-comment-close');
  const supportsHighlight = typeof Highlight === 'function' && !!window.CSS?.highlights;
  let notes = [];
  let ranges = new Map();
  let readingError = '';
  let pending = null;
  let editing = null;
  let returnFocus = null;
  let scheduled = false;

  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(saved)) throw new Error('Invalid stored notes');
    notes = saved.filter(n => n && typeof n.id === 'string' && typeof n.body === 'string'
      && typeof n.quote === 'string' && n.quote.length > 0 && n.quote.length <= limit
      && typeof n.before === 'string' && typeof n.after === 'string');
  } catch {
    readingError = t('无法读取浏览器中的批注。', 'Saved notes could not be read.');
  }

  function showError(message = '') {
    error.textContent = message;
    error.hidden = !message;
  }

  function save(next) {
    try {
      if (readingError) throw new Error('Read unavailable');
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      showError(t('无法保存。请检查浏览器的储存设置或剩余空间。', 'Could not save. Check browser storage settings or available space.'));
      return false;
    }
    notes = next;
    updateHighlights();
    return true;
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
    openButton.textContent = `${t('我的批注', 'My notes')} · ${notes.length}`;
  }

  function activeSelection() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    if (!article.contains(range.startContainer) || !article.contains(range.endContainer)) return null;
    const selected = range.toString();
    const quote = selected.trim();
    if (!quote || quote.length > limit) return null;
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

  function edit(note, trigger) {
    editing = note;
    title.textContent = note.id ? t('编辑批注', 'Edit note') : t('写批注', 'Add note');
    list.hidden = true;
    form.hidden = false;
    form.querySelector('blockquote').textContent = note.quote;
    input.value = note.body ?? '';
    showError(readingError);
    openDialog(trigger);
    input.focus();
  }

  function goToQuote(note) {
    const range = ranges.get(note.id);
    if (!range) return;
    dialog.close();
    const element = range.startContainer.parentElement;
    element.scrollIntoView({ block: 'center' });
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

  function showList(trigger, firstId) {
    editing = null;
    title.textContent = t('我的批注', 'My notes');
    showError(readingError);
    form.hidden = true;
    list.hidden = false;
    list.replaceChildren();
    if (!notes.length) {
      const hint = document.createElement('p');
      hint.textContent = t('选中正文中的词句，再点「写批注」。', 'Select text in the article, then choose “Add note.”');
      list.append(hint);
    }
    const ordered = firstId ? [...notes].sort((a, b) => Number(b.id === firstId) - Number(a.id === firstId)) : notes;
    for (const note of ordered) {
      const card = document.createElement('section');
      card.className = 'reading-comment-card';
      const quote = document.createElement('blockquote');
      quote.textContent = note.quote;
      const body = document.createElement('p');
      body.className = 'reading-comment-body';
      body.textContent = note.body;
      const buttons = document.createElement('div');
      buttons.className = 'reading-comment-controls';
      const located = ranges.has(note.id);
      const jump = action(located ? t('定位原文', 'Go to text') : t('原文位置未找到', 'Text not found'), () => goToQuote(note));
      jump.disabled = !located;
      buttons.append(jump, action(t('编辑', 'Edit'), () => edit(note, openButton)), action(t('删除', 'Delete'), () => {
        buttons.replaceChildren(
          action(t('确认删除', 'Confirm deletion'), () => {
            if (save(notes.filter(n => n.id !== note.id))) showList(openButton);
          }),
          action(t('取消', 'Cancel'), () => showList(openButton, note.id)),
        );
        buttons.firstElementChild.focus();
      }));
      card.append(quote, body, buttons);
      list.append(card);
    }
    openDialog(trigger);
    closeButton.focus();
  }

  // Prevent a mouse click from collapsing the selection before the button acts.
  bubble.addEventListener('mousedown', event => event.preventDefault());
  bubble.addEventListener('click', () => {
    const selection = pending ?? activeSelection();
    if (selection) {
      const { quote, before, after } = selection;
      edit({ quote, before, after }, bubble);
      window.getSelection()?.removeAllRanges();
    }
  });
  openButton.addEventListener('click', () => {
    const selection = activeSelection();
    if (selection) {
      const { quote, before, after } = selection;
      edit({ quote, before, after }, openButton);
      window.getSelection()?.removeAllRanges();
    } else showList(openButton);
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.querySelector('.reading-comment-back').addEventListener('click', () => showList(openButton));
  dialog.addEventListener('close', () => {
    pending = null;
    editing = null;
    returnFocus?.focus({ preventScroll: true });
    queuePosition();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const body = input.value.trim();
    if (!editing || !body) {
      showError(t('请填写批注内容。', 'Enter a note before saving.'));
      return;
    }
    const note = { ...editing, id: editing.id ?? (crypto.randomUUID?.() || String(Date.now())), body };
    const next = editing.id ? notes.map(n => n.id === note.id ? note : n) : [note, ...notes];
    if (save(next)) showList(openButton, note.id);
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
  updateHighlights();
})();
