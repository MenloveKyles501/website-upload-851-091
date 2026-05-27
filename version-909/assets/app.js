(function () {
  const m3u8Sources = window.M3U8_SOURCES || [];

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  // mobile menu
  const toggle = qs('[data-mobile-toggle]');
  const nav = qs('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // home hero carousel
  const hero = qs('[data-hero-carousel]');
  if (hero) {
    const slides = qsa('.hero-slide', hero);
    const prevBtn = qs('[data-hero-prev]', hero);
    const nextBtn = qs('[data-hero-next]', hero);
    let idx = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
    if (idx < 0) idx = 0;
    const show = (next) => {
      if (!slides.length) return;
      idx = (next + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    };
    if (prevBtn) prevBtn.addEventListener('click', () => show(idx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => show(idx + 1));
    setInterval(() => show(idx + 1), 5200);
  }

  // detail player
  const playerShell = qs('[data-player-shell]');
  if (playerShell) {
    const video = qs('video', playerShell);
    const overlay = qs('[data-player-overlay]', playerShell);
    const playBtn = qs('[data-play-btn]', playerShell);
    const lineBtns = qsa('[data-line-btn]', playerShell);
    let hls = null;
    let currentSource = playerShell.getAttribute('data-src') || (m3u8Sources[0] || '');

    function destroyHls() {
      if (hls && typeof hls.destroy === 'function') {
        try { hls.destroy(); } catch (e) {}
      }
      hls = null;
    }

    function setOverlayHidden(hidden) {
      if (!overlay) return;
      overlay.classList.toggle('hidden', hidden);
    }

    function loadSource(src) {
      currentSource = src;
      if (!video || !src) return;
      destroyHls();
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (window.Hls && Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 30,
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            console.warn('HLS fatal error', data);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
      lineBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-line-src') === src));
    }

    async function playVideo() {
      if (!video) return;
      try {
        await video.play();
        setOverlayHidden(true);
      } catch (e) {
        console.warn(e);
      }
    }

    if (video) {
      video.addEventListener('play', () => setOverlayHidden(true));
      video.addEventListener('pause', () => setOverlayHidden(false));
      video.addEventListener('ended', () => setOverlayHidden(false));
      video.addEventListener('click', playVideo);
    }
    if (playBtn) playBtn.addEventListener('click', playVideo);
    lineBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.getAttribute('data-line-src');
        if (src) loadSource(src);
      });
    });
    loadSource(currentSource);
  }

  // search page: fetch catalog and filter results
  const searchRoot = qs('[data-search-page]');
  if (searchRoot) {
    const input = qs('[data-search-input]', searchRoot);
    const category = qs('[data-search-filter]', searchRoot);
    const results = qs('[data-search-results]', searchRoot);
    const count = qs('[data-search-count]', searchRoot);
    let catalog = [];

    function render(list) {
      if (!results) return;
      results.innerHTML = list.map(item => `
        <a class="card" href="${item.page}">
          <div class="poster-wrap">
            <div class="poster-chip">#${item.id}</div>
            <img class="poster-cover" src="./${item.coverIndex}.jpg" alt="${escapeHtml(item.title)}" onerror="this.remove()">
            <div class="poster-fallback"><h3>${escapeHtml(item.title)}</h3></div>
          </div>
          <div class="card-body">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <div class="card-meta"><span>${escapeHtml(item.year)}</span><span>${escapeHtml(item.region)}</span><span>${escapeHtml(item.type)}</span></div>
            <p class="card-summary">${escapeHtml(item.oneLine || item.summary || '')}</p>
          </div>
        </a>
      `).join('');
      if (count) count.textContent = `共 ${list.length} 部`;
    }

    function applyFilter() {
      const q = (input && input.value || '').trim().toLowerCase();
      const f = (category && category.value || 'all');
      let list = catalog.slice();
      if (f !== 'all') list = list.filter(item => item.region.includes(f) || item.type.includes(f) || item.genre.includes(f));
      if (q) list = list.filter(item => [item.title, item.region, item.type, item.genre, item.oneLine, item.summary, ...(item.tags || [])].join(' ').toLowerCase().includes(q));
      render(list.slice(0, 300));
    }

    fetch('assets/catalog.json').then(r => r.json()).then(data => {
      catalog = data;
      render(catalog.slice(0, 300));
      if (input) input.addEventListener('input', applyFilter);
      if (category) category.addEventListener('change', applyFilter);
    }).catch(() => {
      if (results) results.innerHTML = '<p class="small">搜索数据加载失败。</p>';
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
