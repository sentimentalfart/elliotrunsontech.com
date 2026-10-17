import showcaseData from './data/apps.json';

/**
 * 1. LYRIC.TECH PIXELATED 16PX GRID-CELL BUTTON HOVER ENGINE
 * Dynamically divides buttons with [data-btn-grid-anim="true"] into 16x16px cells
 * and triggers a randomized staggered fill wave on hover, focus, or touch.
 */
export function initPixelGridButtons() {
  const CELL = 16;
  const COLOR = 'var(--brand-blurple-hover)';
  const STEP_IN = 8;
  const STEP_OUT = 6;
  const HOLD = 420;
  const instances = [];

  document.querySelectorAll('.button_main-wrap[data-btn-grid-anim="true"]').forEach((btn) => {
    if (btn.dataset.gridBound === 'true') return;
    btn.dataset.gridBound = 'true';

    const el = btn.querySelector('.button_main-element');
    if (!el) return;

    let layer = null;
    let built = false;
    let holdTimer = null;

    const build = () => {
      if (!layer) {
        layer = document.createElement('div');
        layer.className = 'btn-cell-layer';
        el.prepend(layer);
      }
      const cols = Math.ceil(el.offsetWidth / CELL) || 1;
      const rows = Math.ceil(el.offsetHeight / CELL) || 1;
      const n = cols * rows;
      layer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      layer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

      const order = Array.from({ length: n }, (_, i) => i);
      for (let i = n - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        const temp = order[i];
        order[i] = order[j];
        order[j] = temp;
      }

      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const cell = document.createElement('div');
        cell.className = 'btn-cell';
        cell.style.background = COLOR;
        cell.style.setProperty('--d-in', `${order[i] * STEP_IN}ms`);
        cell.style.setProperty('--d-out', `${order[i] * STEP_OUT}ms`);
        frag.appendChild(cell);
      }
      layer.replaceChildren(frag);
      built = true;
    };

    const fill = (on) => {
      clearTimeout(holdTimer);
      if (on && !built) {
        build();
        void layer.offsetWidth;
      }
      if (!built) return;
      el.classList.toggle('is-filled', on);
    };

    btn.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      fill(true);
    });
    btn.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'touch') return;
      fill(false);
    });
    btn.addEventListener(
      'pointerdown',
      (e) => {
        if (e.pointerType !== 'touch') return;
        fill(true);
      },
      { passive: true }
    );
    const release = (e) => {
      if (e.pointerType !== 'touch') return;
      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => fill(false), HOLD);
    };
    btn.addEventListener('pointerup', release, { passive: true });
    btn.addEventListener('pointercancel', release, { passive: true });
    btn.addEventListener('focusin', () => fill(true));
    btn.addEventListener('focusout', () => fill(false));

    instances.push({
      invalidate: () => {
        built = false;
      },
    });
  });

  let resizeTimer = null;
  let lastWidth = window.innerWidth;
  window.addEventListener(
    'resize',
    () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        instances.forEach((inst) => inst.invalidate());
      }, 200);
    },
    { passive: true }
  );
}

/**
 * 2. LYRIC.TECH SPRING-PHYSICS PARTICLE MESH CANVAS (Hero Background)
 * Draws an architectural geometric grid of interactive nodes that react smoothly
 * to pointer proximity and automatically pause when scrolled out of view.
 */
export function initHeroMeshCanvas() {
  const canvas = document.getElementById('hero-mesh-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let nodes = [];
  let inView = true;
  let rafId = null;

  const pointer = { x: -9999, y: -9999, active: false };

  function buildNodes() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const spacing = width > 900 ? 56 : 44;
    nodes = [];
    for (let y = spacing / 2; y < height; y += spacing) {
      for (let x = spacing / 2; x < width; x += spacing) {
        nodes.push({
          bx: x,
          by: y,
          x,
          y,
          vx: 0,
          vy: 0,
          isAccent: (Math.round(x / spacing) + Math.round(y / spacing)) % 7 === 0,
        });
      }
    }
    drawNodes();
  }

  function drawNodes() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const dx = n.x - n.bx;
      const dy = n.y - n.by;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.8) {
        ctx.strokeStyle = 'rgba(88, 101, 242, 0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(n.bx, n.by);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      }

      ctx.fillStyle = n.isAccent
        ? 'rgba(87, 242, 135, 0.45)'
        : dist > 1.5
          ? 'rgba(88, 101, 242, 0.85)'
          : 'rgba(181, 186, 193, 0.18)';
      const size = n.isAccent ? 3 : 2;
      ctx.fillRect(Math.round(n.x - size / 2), Math.round(n.y - size / 2), size, size);
    }
  }

  function tick() {
    if (!inView) {
      rafId = null;
      return;
    }

    let moving = false;
    const radius = 140;
    const radiusSq = radius * radius;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (pointer.active) {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < radiusSq) {
          const d = Math.sqrt(d2) + 0.1;
          const force = (1 - d / radius) * 2.4;
          n.vx += (dx / d) * force;
          n.vy += (dy / d) * force;
        }
      }

      n.vx += (n.bx - n.x) * 0.065;
      n.vy += (n.by - n.y) * 0.065;
      n.vx *= 0.84;
      n.vy *= 0.84;
      n.x += n.vx;
      n.y += n.vy;

      if (Math.abs(n.vx) > 0.02 || Math.abs(n.vy) > 0.02 || Math.abs(n.x - n.bx) > 0.1) {
        moving = true;
      }
    }

    drawNodes();
    if (moving || pointer.active) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  function startLoop() {
    if (reducedMotion || !inView) return;
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  buildNodes();

  const heroSection = canvas.closest('.hero-section');
  if (heroSection && !reducedMotion) {
    heroSection.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
      startLoop();
    });
    heroSection.addEventListener('pointerleave', () => {
      pointer.active = false;
      startLoop();
    });
  }

  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (!inView) pointer.active = false;
      },
      { rootMargin: '150px' }
    ).observe(canvas);
  }

  window.addEventListener('resize', buildNodes, { passive: true });
}

/**
 * 3. RENDER LIVE APP SHOWCASE & COMING SOON GRID FROM src/data/apps.json
 */
export function renderShowcase(data = showcaseData) {
  const selectorList = document.getElementById('live-app-selector-list');
  const previewStage = document.getElementById('live-app-preview-stage');
  const comingSoonGrid = document.getElementById('coming-soon-grid');

  if (selectorList && previewStage && Array.isArray(data.liveApps)) {
    selectorList.replaceChildren();

    const renderActivePreview = (app) => {
      const card = document.createElement('article');
      card.className = 'app-showcase-card';
      card.setAttribute('data-app-id', app.id);

      // Top bar
      const topbar = document.createElement('div');
      topbar.className = 'app-card-topbar';

      const statusPill = document.createElement('span');
      statusPill.className = 'app-status-pill';
      statusPill.textContent = `● ${app.status}`;

      const domainLabel = document.createElement('span');
      domainLabel.className = 'app-domain-label';
      domainLabel.textContent = app.domainLabel;

      topbar.append(statusPill, domainLabel);

      // Body
      const body = document.createElement('div');
      body.className = 'app-card-body';

      const identity = document.createElement('div');
      identity.className = 'app-card-identity';

      const logoBox = document.createElement('div');
      logoBox.className = 'app-logo-box';
      const logoImg = document.createElement('img');
      logoImg.className = 'app-logo-img';
      logoImg.src = app.logo;
      logoImg.alt = `${app.name} emblem`;
      logoBox.appendChild(logoImg);

      const titleWrap = document.createElement('div');
      const title = document.createElement('h3');
      title.className = 'app-card-title';
      title.textContent = app.name;

      const tagline = document.createElement('p');
      tagline.className = 'app-card-tagline';
      tagline.textContent = app.tagline;

      titleWrap.append(title, tagline);
      identity.append(logoBox, titleWrap);

      const desc = document.createElement('p');
      desc.className = 'app-card-description';
      desc.textContent = app.description;

      const highlights = document.createElement('ul');
      highlights.className = 'app-highlights-list';
      (app.highlights || []).forEach((itemText) => {
        const li = document.createElement('li');
        li.className = 'app-highlight-item';
        const bullet = document.createElement('span');
        bullet.className = 'app-highlight-bullet';
        bullet.textContent = '→';
        const span = document.createElement('span');
        span.textContent = itemText;
        li.append(bullet, span);
        highlights.appendChild(li);
      });

      const footer = document.createElement('div');
      footer.className = 'app-card-footer';

      const tagGroup = document.createElement('div');
      tagGroup.className = 'app-tag-group';
      (app.tags || []).forEach((tagText) => {
        const tag = document.createElement('span');
        tag.className = 'app-tag';
        tag.textContent = tagText;
        tagGroup.appendChild(tag);
      });

      const ctaLink = document.createElement('a');
      ctaLink.href = app.url;
      ctaLink.target = '_blank';
      ctaLink.rel = 'noopener noreferrer';
      ctaLink.className = 'button_main-wrap is-primary';
      ctaLink.setAttribute('data-btn-grid-anim', 'true');

      const ctaElem = document.createElement('span');
      ctaElem.className = 'button_main-element';
      const ctaText = document.createElement('span');
      ctaText.className = 'button_main_text';
      ctaText.textContent = `Launch ${app.name} ↗`;
      ctaElem.appendChild(ctaText);
      ctaLink.appendChild(ctaElem);

      footer.append(tagGroup, ctaLink);
      body.append(identity, desc, highlights, footer);
      card.append(topbar, body);

      previewStage.replaceChildren(card);
      initPixelGridButtons();
    };

    data.liveApps.forEach((app, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.role = 'tab';
      btn.className = `supply-heading-item${index === 0 ? ' is-active' : ''}`;
      btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

      const left = document.createElement('span');
      left.className = 'supply-heading-left';
      left.innerHTML = `<svg class="supply-arrow" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M9.88 22.13L18.01 14L9.88 5.87C9.72 5.71 9.62 5.48 9.62 5.25C9.62 4.77 10.02 4.38 10.5 4.38C10.73 4.38 10.95 4.47 11.12 4.63L19.87 13.38C20.21 13.72 20.21 14.28 19.87 14.62L11.12 23.37C10.78 23.71 10.22 23.71 9.88 23.37C9.54 23.03 9.54 22.47 9.88 22.13Z" fill="currentColor"/></svg>`;

      const titleSpan = document.createElement('span');
      titleSpan.className = 'supply-heading-title';
      titleSpan.textContent = app.name;
      left.appendChild(titleSpan);

      const badge = document.createElement('span');
      badge.className = 'supply-heading-badge';
      badge.textContent = app.category;

      btn.append(left, badge);

      const activate = () => {
        selectorList.querySelectorAll('.supply-heading-item').forEach((el) => {
          el.classList.remove('is-active');
          el.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        renderActivePreview(app);
      };

      btn.addEventListener('click', activate);
      btn.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') activate();
      });

      selectorList.appendChild(btn);
    });

    if (data.liveApps[0]) {
      renderActivePreview(data.liveApps[0]);
    }
  }

  // Render Coming Soon Cards
  if (comingSoonGrid && Array.isArray(data.comingSoonApps)) {
    comingSoonGrid.replaceChildren();
    data.comingSoonApps.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'lab-card';
      card.setAttribute('role', 'listitem');

      const topWrap = document.createElement('div');
      const topBar = document.createElement('div');
      topBar.className = 'lab-card-top';

      const codeSpan = document.createElement('span');
      codeSpan.className = 'lab-code';
      codeSpan.textContent = item.code;

      const statusSpan = document.createElement('span');
      statusSpan.className = 'lab-status';
      statusSpan.textContent = item.status;

      topBar.append(codeSpan, statusSpan);

      const title = document.createElement('h3');
      title.className = 'lab-title';
      title.textContent = item.name;

      const category = document.createElement('p');
      category.className = 'lab-category';
      category.style.color = item.accentColor || 'var(--accent-cyan)';
      category.textContent = item.category;

      const desc = document.createElement('p');
      desc.className = 'lab-desc';
      desc.textContent = item.description;

      topWrap.append(topBar, title, category, desc);
      card.appendChild(topWrap);
      comingSoonGrid.appendChild(card);
    });
  }
}

/**
 * 4. SCROLL REVEAL OBSERVER
 */
export function initScrollReveals() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  if (typeof IntersectionObserver === 'undefined') {
    els.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => observer.observe(el));
}

function boot() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  renderShowcase(showcaseData);
  initPixelGridButtons();
  initHeroMeshCanvas();
  initScrollReveals();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
}
