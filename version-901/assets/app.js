(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", panel.classList.contains("is-open"));
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        start();
      });
    });
    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var textInput = panel.querySelector("[data-filter-text]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var noResults = document.querySelector("[data-no-results]");
    var grid = document.querySelector("[data-card-grid]") || document.querySelector("[data-rank-list]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query && textInput) {
      textInput.value = query;
    }
    function currentValue(control) {
      return control ? control.value.trim().toLowerCase() : "";
    }
    function apply() {
      var text = currentValue(textInput);
      var region = currentValue(regionSelect);
      var year = currentValue(yearSelect);
      var type = currentValue(typeSelect);
      var category = currentValue(categorySelect);
      var visible = 0;
      cards.forEach(function (card) {
        var search = (card.getAttribute("data-search") || "").toLowerCase();
        var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
        var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
        var cardType = (card.getAttribute("data-type") || "").toLowerCase();
        var cardCategory = (card.getAttribute("data-category") || "").toLowerCase();
        var matched = true;
        if (text && search.indexOf(text) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle("is-visible", visible === 0);
      }
    }
    [textInput, regionSelect, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });
    panel.querySelectorAll("[data-view]").forEach(function (button) {
      button.addEventListener("click", function () {
        panel.querySelectorAll("[data-view]").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        if (grid) {
          grid.classList.toggle("is-list", button.getAttribute("data-view") === "list");
        }
      });
    });
    apply();
  }

  window.initMoviePlayer = function (url) {
    var video = document.querySelector(".movie-player-video");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !url) {
      return;
    }
    var loaded = false;
    var hls = null;
    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }
      video.src = url;
    }
    function play() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      load();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
