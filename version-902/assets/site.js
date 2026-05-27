
(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('[data-nav-toggle]');
  if (header && toggle) {
    toggle.addEventListener('click', () => header.classList.toggle('nav-open'));
  }

  // Hero carousel
  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let active = 0;
  let timer = null;

  function activate(index) {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
  }

  function start() {
    if (slides.length < 2) return;
    stop();
    timer = window.setInterval(() => activate(active + 1), 6000);
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  if (slides.length) {
    dots.forEach((dot, i) => dot.addEventListener('click', () => {
      activate(i);
      start();
    }));
    if (prev) prev.addEventListener('click', () => { activate(active - 1); start(); });
    if (next) next.addEventListener('click', () => { activate(active + 1); start(); });
    activate(0);
    start();
  }

  // Detail player
  const video = document.querySelector('[data-movie-video]');
  const playButton = document.querySelector('[data-play-button]');
  const playerFrame = document.querySelector('[data-player-frame]');
  if (video && playButton) {
    const updatePlaying = () => {
      playButton.classList.toggle('is-playing', !video.paused);
    };
    playButton.addEventListener('click', async () => {
      try {
        await video.play();
        updatePlaying();
      } catch (err) {
        video.controls = true;
      }
    });
    video.addEventListener('play', updatePlaying);
    video.addEventListener('pause', updatePlaying);
    video.addEventListener('ended', updatePlaying);
    if (playerFrame) {
      playerFrame.addEventListener('click', () => {
        if (video.paused) {
          video.play().catch(() => { video.controls = true; });
        } else {
          video.pause();
        }
      });
    }
  }

  // Search page
  const searchData = window.MOVIE_INDEX || [];
  const searchInput = document.querySelector('[data-search-input]');
  const resultsWrap = document.querySelector('[data-search-results]');
  const statsWrap = document.querySelector('[data-search-stats]');
  if (resultsWrap && statsWrap && searchInput) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    searchInput.value = initial;

    const render = (query) => {
      const q = String(query || '').trim().toLowerCase();
      let matched = searchData.filter(item => {
        if (!q) return true;
        const haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine, item.category].join(' ').toLowerCase();
        return haystack.includes(q);
      });
      matched = matched.sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 200);
      statsWrap.textContent = q ? `找到 ${matched.length} 条相关影片` : `展示 ${matched.length} 条热门推荐`;
      resultsWrap.innerHTML = matched.length ? matched.map(item => `
        <article class="movie-card movie-card--small">
          <a href="${item.slug}" class="movie-card__poster"><img src="${item.image}" alt="${item.title}"><span class="movie-card__year">${item.year}</span></a>
          <div class="movie-card__body">
            <h3><a href="${item.slug}">${item.title}</a></h3>
            <p class="movie-card__meta">${item.region} · ${item.type} · ${item.genre}</p>
            <p class="movie-card__line">${item.oneLine || ''}</p>
            <div class="movie-card__tags">${(item.tags || []).slice(0, 3).map(t => `<span>${t}</span>`).join('')}</div>
          </div>
        </article>
      `).join('') : '<div class="empty-state">没有找到符合条件的影片。</div>';
    };

    searchInput.addEventListener('input', () => render(searchInput.value));
    render(initial);
  }
})();
