/* ============================================================
   main.js — 个人主页动态逻辑
   技术要点：
     1. 打字机效果          — setTimeout 递归模拟逐字输出
     2. 标签动态渲染        — JS 操作 DOM 生成标签节点
     3. 项目卡片动态渲染    — 数据驱动，JS 遍历数组构建 DOM
     4. 滚动淡入动画        — Intersection Observer API
     5. 导航栏高亮          — Intersection Observer 监听各 section
     6. localStorage 留言板 — 读写本地"数据库"，持久化留言数据
     7. 页面滚动进度条      — scroll 事件实时计算百分比
   ============================================================ */

/* ── 1. 页面数据（集中管理，便于维护） ── */

const TYPING_TEXT = "吉林大学 · CS大二 · RLHF & 多智能体研究";

const TAGS = [
  "RLHF", "Reward Model", "Multi-Agent",
  "ToM Reasoning", "MACM", "Python", "AI Product"
];

/**
 * 项目数据数组
 * 每个对象对应一张卡片，JS 会遍历它动态生成 DOM
 * 占位项目：可随时替换为真实项目信息
 */
const PROJECTS = [
  {
    title: "MACM — 多智能体 ToM 推理框架",
    desc:  "面向心智理论（Theory of Mind）推理的多智能体协作框架，探索智能体在复杂社会场景中的信念建模与推断能力。",
    tags:  ["Multi-Agent", "ToM", "Python"],
    link:  "#"
  },
  {
    title: "奖励模型研究",
    desc:  "聚焦 RLHF 流程中的奖励模型设计与偏好学习，研究其对大语言模型对齐效果的影响。",
    tags:  ["RLHF", "Reward Model", "LLM"],
    link:  "#"
  },
  {
    title: "项目占位 · 待更新",
    desc:  "更多项目正在进行中，敬请期待。",
    tags:  ["WIP"],
    link:  "#"
  }
];

/* ── 2. 工具函数 ── */

/** 创建带文本内容的 DOM 元素 */
function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text)      el.textContent = text;
  return el;
}

/** 格式化时间戳为 "YYYY-MM-DD HH:mm" */
function formatDate(ts) {
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
       + `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ── 3. 打字机效果 ── */

/**
 * 将 text 逐字输出到 #typing-output 元素
 * 使用 setTimeout 递归调用模拟打字节奏
 */
function typeWriter(text, container, speed = 60) {
  let index = 0;
  function type() {
    if (index < text.length) {
      container.textContent += text[index];
      index++;
      setTimeout(type, speed);
    }
  }
  // 延迟 600ms 再开始，等页面动画稳定后再打字
  setTimeout(type, 600);
}

/* ── 4. 标签动态渲染 ── */

/**
 * 遍历 TAGS 数组，为每个标签创建 <span class="tag"> 节点
 * animation-delay 让标签依次弹入（CSS @keyframes tagPop）
 */
function renderTags() {
  const container = document.getElementById("tags-container");
  TAGS.forEach((tag, i) => {
    const span = createElement("span", "tag", tag);
    // 每个标签延迟 0.1s * i 进场，形成波浪效果
    span.style.animationDelay = `${0.8 + i * 0.08}s`;
    container.appendChild(span);
  });
}

/* ── 5. 项目卡片动态渲染 ── */

/**
 * 遍历 PROJECTS 数组，为每个项目构建完整卡片 DOM 并插入网格
 * 数据与视图分离：修改 PROJECTS 数组即可更新页面内容
 */
function renderProjects() {
  const grid = document.getElementById("projects-grid");

  PROJECTS.forEach((proj, i) => {
    // 外层卡片
    const card = createElement("div", "project-card");
    card.style.animationDelay = `${i * 0.12}s`;
    if (proj.link && proj.link !== "#") {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => window.open(proj.link, "_blank"));
    }

    // 标题
    card.appendChild(createElement("h3", "card-title", proj.title));

    // 描述
    card.appendChild(createElement("p", "card-desc", proj.desc));

    // 技术标签行
    const tagRow = createElement("div", "card-tags");
    proj.tags.forEach(t => tagRow.appendChild(createElement("span", "card-tag", t)));
    card.appendChild(tagRow);

    grid.appendChild(card);
  });
}

/* ── 6. Intersection Observer — 滚动淡入 ── */

/**
 * 观察所有带 .fade-target 的 section
 * 当元素进入视口时，添加 .visible 触发 CSS 过渡
 */
function initScrollAnimation() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // 已触发后停止观察，避免反复触发
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }   // 进入视口 12% 时触发
  );

  document.querySelectorAll(".fade-target").forEach(el => observer.observe(el));
}

/* ── 7. Intersection Observer — 导航栏高亮 ── */

/**
 * 监听各 section 的可见状态，更新对应导航链接的 .active 类
 * rootMargin 设为负值，使高亮在 section 接近中部时触发
 */
function initNavHighlight() {
  const sections = document.querySelectorAll(".section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${id}`
            );
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach(s => observer.observe(s));
}

/* ── 8. localStorage 留言板 ── */

const STORAGE_KEY = "wlh_messages";   // localStorage 中的键名

/** 从 localStorage 读取全部留言，不存在则返回空数组 */
function loadMessages() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/** 将留言数组序列化后写入 localStorage */
function saveMessages(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

/**
 * 将留言数组渲染为 DOM 节点
 * 最新的留言显示在最上方（reverse 倒序遍历）
 */
function renderMessages() {
  const list = document.getElementById("messages-list");
  const countEl = document.getElementById("msg-count");
  const messages = loadMessages();

  list.innerHTML = "";   // 清空后重新渲染

  if (messages.length === 0) {
    list.appendChild(createElement("p", "empty-hint", "暂无留言，来留下第一条吧！"));
    countEl.textContent = "";
    return;
  }

  countEl.textContent = `(${messages.length} 条)`;

  // 倒序展示，最新在前
  [...messages].reverse().forEach((msg, i) => {
    const item = createElement("div", "message-item");
    item.style.animationDelay = `${i * 0.05}s`;

    const meta = createElement("div", "message-meta");
    meta.appendChild(createElement("span", "message-author", msg.name));
    meta.appendChild(createElement("span", "message-date", formatDate(msg.timestamp)));
    item.appendChild(meta);

    item.appendChild(createElement("p", "message-body", msg.content));
    list.appendChild(item);
  });
}

/** 表单提交：收集数据 → 存入 localStorage → 刷新列表 */
function initContactForm() {
  const form    = document.getElementById("message-form");
  const nameEl  = document.getElementById("f-name");
  const emailEl = document.getElementById("f-email");
  const bodyEl  = document.getElementById("f-content");
  const hint    = document.getElementById("form-hint");

  form.addEventListener("submit", e => {
    e.preventDefault();   // 阻止默认表单跳转

    const name    = nameEl.value.trim();
    const content = bodyEl.value.trim();
    if (!name || !content) return;

    // 构造留言对象
    const msg = {
      name,
      email:     emailEl.value.trim(),
      content,
      timestamp: Date.now()   // 时间戳用于排序和展示
    };

    // 读 → 追加 → 写：模拟数据库的 INSERT 操作
    const messages = loadMessages();
    messages.push(msg);
    saveMessages(messages);

    // 重置表单并提示
    form.reset();
    hint.textContent = "留言已保存！感谢您的留言 ✓";
    setTimeout(() => { hint.textContent = ""; }, 3000);

    // 刷新留言展示
    renderMessages();
  });
}

/* ── 9. 滚动进度条 ── */

/**
 * 监听 scroll 事件，计算已滚动百分比
 * 实时更新顶部进度条的 width
 */
function initProgressBar() {
  // 动态创建进度条元素，不污染 HTML 结构
  const bar = document.createElement("div");
  bar.id = "progress-bar";
  document.body.prepend(bar);

  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY;
    const total    = document.body.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? (scrolled / total) * 100 : 0;
    bar.style.width = `${pct}%`;
  }, { passive: true });
}

/* ── 10. 导航栏滚动效果 ── */

function initNavbar() {
  const nav = document.getElementById("navbar");

  // 页面加载后短暂延迟再显示导航栏，避免与内容动画冲突
  setTimeout(() => nav.classList.add("nav-visible"), 200);

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  }, { passive: true });
}

/* ── 11. 入口：DOMContentLoaded 后按序初始化 ── */

document.addEventListener("DOMContentLoaded", () => {
  // 打字机效果
  const typingEl = document.getElementById("typing-output");
  typeWriter(TYPING_TEXT, typingEl);

  // 动态渲染
  renderTags();
  renderProjects();

  // 交互逻辑
  initScrollAnimation();
  initNavHighlight();
  initContactForm();
  initProgressBar();
  initNavbar();

  // 初始化时从 localStorage 加载并显示历史留言
  renderMessages();
});
