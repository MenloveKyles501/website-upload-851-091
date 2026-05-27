const playerMessages = new WeakMap();

function showMessage(container, message) {
  let messageNode = playerMessages.get(container);

  if (!messageNode) {
    messageNode = document.createElement("div");
    messageNode.className = "player-message";
    container.appendChild(messageNode);
    playerMessages.set(container, messageNode);
  }

  messageNode.textContent = message;
  messageNode.hidden = false;

  window.clearTimeout(messageNode.hideTimer);
  messageNode.hideTimer = window.setTimeout(function () {
    messageNode.hidden = true;
  }, 4200);
}

async function attachHls(video, source) {
  if (video.dataset.loaded === "true") {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    video.dataset.loaded = "true";
    return;
  }

  try {
    const module = await import("./hls-core.js");
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      video.dataset.loaded = "true";
      return;
    }
  } catch (error) {
    console.error("HLS 初始化失败", error);
  }

  video.src = source;
  video.dataset.loaded = "true";
}

async function startPlayback(container) {
  const video = container.querySelector("video[data-src]");

  if (!video) {
    return;
  }

  const source = video.dataset.src;

  if (!source) {
    showMessage(container, "当前影片暂未绑定播放源。");
    return;
  }

  await attachHls(video, source);
  container.classList.add("is-playing");

  try {
    await video.play();
  } catch (error) {
    container.classList.remove("is-playing");
    showMessage(container, "浏览器阻止了自动播放，请再次点击播放按钮。");
  }
}

function setupPlayer(container) {
  const video = container.querySelector("video[data-src]");
  const overlay = container.querySelector(".player-overlay");

  if (!video || !overlay) {
    return;
  }

  overlay.addEventListener("click", function () {
    startPlayback(container);
  });

  video.addEventListener("play", function () {
    container.classList.add("is-playing");
  });

  video.addEventListener("pause", function () {
    if (!video.ended) {
      container.classList.add("is-playing");
    }
  });

  video.addEventListener("ended", function () {
    container.classList.remove("is-playing");
  });

  video.addEventListener("error", function () {
    showMessage(container, "播放源加载失败，请刷新页面后重试。");
  });
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
