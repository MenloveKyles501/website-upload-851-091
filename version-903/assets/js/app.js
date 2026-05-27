(() => {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const initMobileMenu = () => {
    const toggle = document.querySelector(".mobile-toggle");
    const panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  };

  const initHero = () => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = [...hero.querySelectorAll("[data-hero-slide]")];
    const dots = [...hero.querySelectorAll("[data-hero-dot]")];
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    let index = 0;
    const setSlide = (target) => {
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    };
    prev && prev.addEventListener("click", () => setSlide(index - 1));
    next && next.addEventListener("click", () => setSlide(index + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => setSlide(i)));
    window.setInterval(() => setSlide(index + 1), 5000);
  };

  const initFilters = () => {
    document.querySelectorAll("[data-filter-bar]").forEach((bar) => {
      const list = bar.parentElement.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      const input = bar.querySelector("[data-filter-input]");
      const type = bar.querySelector("[data-filter-type]");
      const year = bar.querySelector("[data-filter-year]");
      const reset = bar.querySelector("[data-filter-reset]");
      const cards = [...list.querySelectorAll(".movie-card, .ranking-item")];
      const queryName = bar.getAttribute("data-read-query");
      if (queryName && input) {
        const params = new URLSearchParams(window.location.search);
        const value = params.get(queryName);
        if (value) {
          input.value = value;
        }
      }
      const apply = () => {
        const term = (input && input.value ? input.value : "").trim().toLowerCase();
        const typeValue = type && type.value ? type.value : "";
        const yearValue = year && year.value ? year.value : "";
        cards.forEach((card) => {
          const haystack = card.getAttribute("data-search") || "";
          const cardType = card.getAttribute("data-type") || "";
          const cardYear = card.getAttribute("data-year") || "";
          const matchTerm = !term || haystack.includes(term);
          const matchType = !typeValue || cardType === typeValue;
          const matchYear = !yearValue || cardYear === yearValue;
          card.classList.toggle("is-hidden", !(matchTerm && matchType && matchYear));
        });
      };
      [input, type, year].forEach((node) => {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      reset && reset.addEventListener("click", () => {
        if (input) {
          input.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
      apply();
    });
  };

  const initPlayers = () => {
    document.querySelectorAll("[data-player]").forEach((shell) => {
      const video = shell.querySelector("video");
      const playButtons = shell.querySelectorAll("[data-play], [data-play-small]");
      const mute = shell.querySelector("[data-mute]");
      const full = shell.querySelector("[data-fullscreen]");
      const progress = shell.querySelector("[data-progress]");
      const time = shell.querySelector("[data-time]");
      if (!video) {
        return;
      }
      let hlsInstance = null;
      const loadStream = () => {
        if (video.dataset.ready === "true") {
          return;
        }
        const stream = video.getAttribute("data-stream");
        if (!stream) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
        video.dataset.ready = "true";
      };
      const updateState = () => {
        shell.classList.toggle("is-playing", !video.paused);
        playButtons.forEach((button) => {
          button.textContent = video.paused ? "播放" : "暂停";
        });
      };
      const togglePlay = () => {
        loadStream();
        if (video.paused) {
          const promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(() => {});
          }
        } else {
          video.pause();
        }
      };
      const syncTime = () => {
        if (progress) {
          progress.max = Number.isFinite(video.duration) ? video.duration : 0;
          progress.value = Number.isFinite(video.currentTime) ? video.currentTime : 0;
        }
        if (time) {
          time.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }
      };
      playButtons.forEach((button) => button.addEventListener("click", togglePlay));
      video.addEventListener("click", togglePlay);
      video.addEventListener("play", updateState);
      video.addEventListener("pause", updateState);
      video.addEventListener("timeupdate", syncTime);
      video.addEventListener("loadedmetadata", syncTime);
      progress && progress.addEventListener("input", () => {
        loadStream();
        video.currentTime = Number(progress.value || 0);
      });
      mute && mute.addEventListener("click", () => {
        video.muted = !video.muted;
        mute.textContent = video.muted ? "取消静音" : "静音";
      });
      full && full.addEventListener("click", () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          shell.requestFullscreen && shell.requestFullscreen();
        }
      });
      window.addEventListener("beforeunload", () => {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
      updateState();
      syncTime();
    });
  };

  ready(() => {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
