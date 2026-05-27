
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const nav = $('.site-nav');
  const toggle = $('.menu-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Active nav highlight
  const path = location.pathname.replace(/\/?$/, '/');
  $$('.site-nav a').forEach(a => {
    const href = new URL(a.getAttribute('href'), location.origin).pathname.replace(/\/?$/, '/');
    if (path === href) a.classList.add('active');
  });

  function sortCards(cards, mode) {
    const byTitle = (a, b) => a.dataset.title.localeCompare(b.dataset.title, 'zh-Hans-CN');
    const byYear = (a, b) => (parseInt(b.dataset.year || '0', 10) - parseInt(a.dataset.year || '0', 10)) || byTitle(a, b);
    if (mode === 'title-asc') return cards.sort(byTitle);
    if (mode === 'year-desc') return cards.sort(byYear);
    return cards;
  }

  function filterScope(scopeEl) {
    const input = $('[data-filter-input]', scopeEl);
    const select = $('[data-sort-select]', scopeEl);
    const grid = $('[data-card-grid]', scopeEl);
    if (!input || !select || !grid) return;

    const cards = $$('.movie-card', grid);
    cards.forEach(card => {
      const poster = $('.poster', card);
      const title = $('.movie-body h3', card)?.textContent || '';
      const year = $('.meta-line', card)?.textContent || '';
      const tags = $('.tag-row', card)?.textContent || '';
      card.dataset.title = (title + ' ' + year + ' ' + tags).toLowerCase();
      card.dataset.year = (year.match(/\d{4}/) || ['0'])[0];
    });

    function apply() {
      const q = input.value.trim().toLowerCase();
      const mode = select.value;
      const ordered = sortCards(cards.slice(), mode);
      ordered.forEach(card => grid.appendChild(card));
      ordered.forEach(card => {
        const visible = !q || card.dataset.title.includes(q);
        card.style.display = visible ? '' : 'none';
      });
    }
    input.addEventListener('input', apply);
    select.addEventListener('change', apply);
    apply();
  }

  $$('[data-filter-scope]').forEach(filterScope);

  // Search page: render using embedded catalog
  const searchPage = $('[data-search-page]');
  if (searchPage && window.SITE_CATALOG) {
    const input = $('[data-global-search]', searchPage);
    const btn = $('[data-search-submit]', searchPage);
    const results = $('[data-search-results]', searchPage);
    const escapeHtml = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[ch]));
    const card = item => `
      <article class="movie-card" style="--c1:${item.c1};--c2:${item.c2};">
        <a class="poster" href="movie/${item.slug}.html"><div class="poster-badge">${escapeHtml(item.type)}</div><div class="poster-initial">${escapeHtml(item.initial)}</div><div class="poster-year">${escapeHtml(item.year)}</div></a>
        <div class="movie-body"><div class="meta-line">${escapeHtml(item.year)} · ${escapeHtml(item.region)} · ${escapeHtml(item.type)}</div><h3><a href="movie/${item.slug}.html">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.one_line)}</p><div class="tag-row">${item.genres.slice(0,2).concat(item.tags.slice(0,2)).map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div></div>
      </article>`;

    function search() {
      const q = (input.value || '').trim().toLowerCase();
      const matches = !q ? window.SITE_CATALOG.slice(0, 24) : window.SITE_CATALOG.filter(item => {
        const hay = [item.title, item.year, item.type, item.region, item.genres.join(' '), item.tags.join(' '), item.summary, item.review].join(' ').toLowerCase();
        return hay.includes(q);
      }).slice(0, 120);
      results.innerHTML = matches.map(card).join('') || '<div class="page-desc">没有找到匹配结果。</div>';
    }
    input.addEventListener('input', search);
    btn.addEventListener('click', search);
    const params = new URLSearchParams(location.search);
    if (params.get('q')) input.value = params.get('q');
    search();
  }

  // Detail player using Hls.js and a public HLS demo stream.
  const player = $('[data-player]');
  const trigger = $('.play-trigger');
  if (player && trigger) {
    const src = trigger.dataset.hlsSrc;
    let started = false;
    function initPlayer() {
      if (started) return;
      started = true;
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(player);
        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
          player.play().catch(()=>{});
        });
        return;
      }
      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = src;
        player.play().catch(()=>{});
        return;
      }
      player.outerHTML = '<div class="page-desc" style="padding:16px;">当前浏览器不支持该播放方式。</div>';
    }
    trigger.addEventListener('click', initPlayer);
    // preload a source on click button press only for clarity
  }
})();
