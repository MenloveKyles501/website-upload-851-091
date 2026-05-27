const MovieSite = (() => {
    function qs(selector, root = document) {
        return root.querySelector(selector);
    }

    function qsa(selector, root = document) {
        return Array.from(root.querySelectorAll(selector));
    }

    function initMenu() {
        const button = qs('[data-menu-toggle]');
        const menu = qs('[data-mobile-menu]');
        if (!button || !menu) return;
        button.addEventListener('click', () => {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        const root = qs('[data-hero-carousel]');
        if (!root) return;
        const slides = qsa('[data-hero-slide]', root);
        const dots = qsa('[data-hero-dot]', root);
        const prev = qs('[data-hero-prev]', root);
        const next = qs('[data-hero-next]', root);
        if (!slides.length) return;
        let active = 0;
        let timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
        }

        function start() {
            stop();
            timer = window.setInterval(() => show(active + 1), 5000);
        }

        function stop() {
            if (timer) window.clearInterval(timer);
        }

        if (prev) prev.addEventListener('click', () => {
            show(active - 1);
            start();
        });
        if (next) next.addEventListener('click', () => {
            show(active + 1);
            start();
        });
        dots.forEach((dot, i) => dot.addEventListener('click', () => {
            show(i);
            start();
        }));
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initSearch() {
        const input = qs('[data-card-search]');
        const cards = qsa('[data-card]');
        const buttons = qsa('[data-filter]');
        if (!cards.length) return;
        let filter = 'all';

        function apply() {
            const query = input ? input.value.trim().toLowerCase() : '';
            let visible = 0;
            cards.forEach(card => {
                const haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags')).toLowerCase();
                const cardFilter = card.getAttribute('data-category') || '';
                const okQuery = !query || haystack.includes(query);
                const okFilter = filter === 'all' || cardFilter === filter;
                const show = okQuery && okFilter;
                card.style.display = show ? '' : 'none';
                if (show) visible += 1;
            });
            const empty = qs('[data-empty-state]');
            if (empty) empty.style.display = visible ? 'none' : '';
        }

        if (input) input.addEventListener('input', apply);
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                filter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(item => item.classList.toggle('is-active', item === button));
                apply();
            });
        });
        apply();
    }

    function initPlayer(source) {
        const video = qs('[data-video-player]');
        const overlay = qs('[data-play-overlay]');
        const button = qs('[data-play-button]');
        if (!video || !source) return;
        let ready = false;

        function load() {
            if (ready) return;
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            load();
            if (overlay) overlay.classList.add('is-hidden');
            video.controls = true;
            const task = video.play();
            if (task && typeof task.catch === 'function') {
                task.catch(() => {
                    if (overlay) overlay.classList.remove('is-hidden');
                });
            }
        }

        if (overlay) overlay.addEventListener('click', play);
        if (button) button.addEventListener('click', event => {
            event.stopPropagation();
            play();
        });
        video.addEventListener('click', () => {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', () => {
            if (overlay) overlay.classList.add('is-hidden');
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initMenu();
        initHero();
        initSearch();
    });

    return {
        initPlayer
    };
})();
