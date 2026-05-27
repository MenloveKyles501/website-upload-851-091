(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  const filterPage = document.querySelector("[data-filter-page]");

  if (filterPage) {
    const keywordInput = filterPage.querySelector("[data-filter-keyword]");
    const yearSelect = filterPage.querySelector("[data-filter-year]");
    const regionSelect = filterPage.querySelector("[data-filter-region]");
    const genreSelect = filterPage.querySelector("[data-filter-genre]");
    const cards = Array.from(filterPage.querySelectorAll(".movie-card"));
    const emptyState = filterPage.querySelector("[data-empty-state]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }

    const normalize = function (value) {
      return (value || "").toString().trim().toLowerCase();
    };

    const applyFilters = function () {
      const keyword = normalize(keywordInput ? keywordInput.value : "");
      const year = normalize(yearSelect ? yearSelect.value : "");
      const region = normalize(regionSelect ? regionSelect.value : "");
      const genre = normalize(genreSelect ? genreSelect.value : "");
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize(
          [
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent,
          ].join(" "),
        );

        const matched =
          (!keyword || haystack.includes(keyword)) &&
          (!year || normalize(card.dataset.year) === year) &&
          (!region || normalize(card.dataset.region) === region) &&
          (!genre || haystack.includes(genre));

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    };

    [keywordInput, yearSelect, regionSelect, genreSelect].forEach(
      function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      },
    );

    applyFilters();
  }
})();
