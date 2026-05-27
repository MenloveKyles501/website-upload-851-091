(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var header = document.querySelector("[data-site-header]");
        var toggle = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        if (header) {
            var setHeaderState = function () {
                header.classList.toggle("is-scrolled", window.scrollY > 8);
            };
            setHeaderState();
            window.addEventListener("scroll", setHeaderState, { passive: true });
        }

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            show(0);
            start();
        });

        document.querySelectorAll("[data-search-go]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var action = form.getAttribute("action") || "./search.html";
                window.location.href = action + (query ? "?q=" + encodeURIComponent(query) : "");
            });
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector(".js-search-input");
            var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
            var container = panel.parentElement || document;
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-filter-card]"));
            var emptyState = panel.querySelector("[data-empty-state]");
            var activeValue = "";
            var params = new URLSearchParams(window.location.search);
            var incomingQuery = params.get("q") || "";

            if (input && incomingQuery) {
                input.value = incomingQuery;
            }

            function applyFilter() {
                var query = normalize(input ? input.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-filter-text"));
                    var matchedQuery = !query || text.indexOf(query) !== -1;
                    var matchedChip = !activeValue || text.indexOf(activeValue) !== -1;
                    var matched = matchedQuery && matchedChip;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    activeValue = normalize(chip.getAttribute("data-filter-value"));
                    applyFilter();
                });
            });

            if (input) {
                input.addEventListener("input", applyFilter);
            }

            applyFilter();
        });
    });
})();
