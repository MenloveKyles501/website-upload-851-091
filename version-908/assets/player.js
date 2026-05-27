(function () {
    function attachSource(video, source) {
        var Hls = window.Hls;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return null;
        }

        if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (_event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    video.src = source;
                }
            });
            return hls;
        }

        video.src = source;
        return null;
    }

    window.initMoviePlayer = function (options) {
        var video = document.querySelector(options.videoSelector);
        var button = document.querySelector(options.buttonSelector);
        var source = options.source;

        if (!video || !source) {
            return;
        }

        attachSource(video, source);

        function hideButton() {
            if (button) {
                button.classList.add("is-hidden");
            }
        }

        function startPlayback() {
            hideButton();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        video.addEventListener("play", hideButton);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
    };
})();
