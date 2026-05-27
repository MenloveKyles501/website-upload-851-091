import { H as Hls } from './hls-vendor.js';

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function setupNav() {
  const nav = $('[data-site-nav]');
  const toggle = $('[data-nav-toggle]');
  if (!nav || !toggle) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(event.target) || toggle.contains(event.target)) return;
    nav.classList.remove('open');
  });
}

function setupSearch() {
  const input = $('[data-search-input]');
  const grid = $('[data-search-grid]');
  if (!input || !grid) return;
  const items = $all('[data-search-item]', grid);
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  empty.textContent = '没有找到匹配的内容';
  function apply() {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    items.forEach((item) => {
      const text = (item.getAttribute('data-search-text') || '').toLowerCase();
      const match = !q || text.includes(q);
      item.style.display = match ? '' : 'none';
      if (match) shown += 1;
    });
    if (shown === 0) {
      if (!grid.contains(empty)) grid.appendChild(empty);
    } else if (grid.contains(empty)) {
      empty.remove();
    }
  }
  input.addEventListener('input', apply);
  apply();
}

function setupHeroCarousel() {
  const carousel = $('[data-hero-carousel]');
  if (!carousel) return;
  const slides = $all('[data-hero-slide]', carousel);
  const dots = $all('[data-hero-dot]', carousel);
  const prev = $('[data-hero-prev]', carousel);
  const next = $('[data-hero-next]', carousel);
  if (!slides.length) return;
  let index = slides.findIndex((slide) => slide.classList.contains('active'));
  if (index < 0) index = 0;
  let timer = null;
  function render(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }
  function play() {
    stop();
    timer = setInterval(() => render(index + 1), 5000);
  }
  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  prev?.addEventListener('click', () => { render(index - 1); play(); });
  next?.addEventListener('click', () => { render(index + 1); play(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { render(i); play(); }));
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', play);
  render(index);
  play();
}

function setupPlayers() {
  const shells = $all('.js-player');
  shells.forEach((shell) => {
    const video = $('.video-element', shell);
    const btn = $('.video-play-overlay', shell);
    const src = shell.getAttribute('data-hls-src');
    if (!video || !btn || !src) return;
    let hls = null;
    let loaded = false;
    function loadSource() {
      if (loaded) return;
      loaded = true;
      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          lowLatencyMode: true,
          enableWorker: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            shell.classList.add('playing');
            video.src = src;
          }
        });
      } else {
        video.src = src;
      }
    }
    async function start() {
      loadSource();
      try {
        await video.play();
        shell.classList.add('playing');
      } catch (err) {
        shell.classList.add('playing');
      }
    }
    btn.addEventListener('click', start);
    video.addEventListener('click', start);
    video.addEventListener('play', () => shell.classList.add('playing'));
    video.addEventListener('pause', () => shell.classList.remove('playing'));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupSearch();
  setupHeroCarousel();
  setupPlayers();
});
