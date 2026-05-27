(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.js-search-form').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = 'search.html';
      }
    });
  });

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function() {
        show(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('.js-page-filter');
  var filterList = document.querySelector('[data-filter-list]');
  var note = document.querySelector('[data-search-note]');
  var activeWord = '';
  var getQueryValue = function() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  };
  var applyFilter = function(value) {
    if (!filterList) {
      return;
    }
    var words = String(value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    var items = Array.prototype.slice.call(filterList.children);
    items.forEach(function(item) {
      var haystack = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
      var match = words.every(function(word) {
        return haystack.indexOf(word) !== -1;
      });
      item.classList.toggle('is-filter-hidden', !match);
    });
    if (note) {
      note.textContent = words.length ? '筛选结果已更新。' : '输入关键词或点击标签快速查找。';
    }
  };
  if (filterInput && filterList) {
    var initial = getQueryValue();
    if (initial) {
      filterInput.value = initial;
      applyFilter(initial);
    }
    filterInput.addEventListener('input', function() {
      activeWord = '';
      document.querySelectorAll('[data-filter-word]').forEach(function(btn) {
        btn.classList.remove('is-active');
      });
      applyFilter(filterInput.value);
    });
    document.querySelectorAll('[data-filter-word]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        activeWord = btn.getAttribute('data-filter-word') || '';
        filterInput.value = activeWord;
        document.querySelectorAll('[data-filter-word]').forEach(function(other) {
          other.classList.toggle('is-active', other === btn);
        });
        applyFilter(activeWord);
      });
    });
  }
})();

function initVideoPlayer(mediaSource) {
  var video = document.querySelector('.video-player');
  var button = document.querySelector('[data-play-button]');
  if (!video || !mediaSource) {
    return;
  }
  var loaded = false;
  var hlsInstance = null;
  var start = function() {
    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaSource;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(mediaSource);
        hlsInstance.attachMedia(video);
      } else {
        video.src = mediaSource;
      }
      loaded = true;
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {});
    }
    if (button) {
      button.classList.add('is-hidden');
    }
  };
  if (button) {
    button.addEventListener('click', start);
  }
  video.addEventListener('click', function() {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function() {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
