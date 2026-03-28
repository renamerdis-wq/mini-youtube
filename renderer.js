/* ===== DOM References ===== */
const frame = document.getElementById("frame");
const playerView = document.getElementById("playerView");
const cleanView = document.getElementById("cleanView");
const cleanOverlay = document.getElementById("cleanOverlay");
const cleanHint = document.getElementById("cleanHint");
const welcomeScreen = document.getElementById("welcomeScreen");
const urlInput = document.getElementById("urlInput");
const scaleLabel = document.getElementById("scaleLabel");
const opacitySlider = document.getElementById("opacitySlider");
const opacityLabel = document.getElementById("opacityLabel");
const settingsPanel = document.getElementById("settingsPanel");
const resizeHandle = document.getElementById("resizeHandle");
const decoTop = document.getElementById("decoTop");
const decoBottom = document.getElementById("decoBottom");
const decoEyes = document.getElementById("decoEyes");

let settingsOpen = false;
let resizeState = null;
let currentVideoUrl = null;
let cleanMode = false;

/* ===== Skin Decorations ===== */
const skinDecorations = {
  bear: {
    top: '<span class="ear ear-l"></span><span class="ear ear-r"></span>',
    bottom: '<span class="foot"></span><span class="foot"></span>',
    eyes: '<span class="eye" style="position:absolute;top:8px;left:calc(50% - 20px)"></span><span class="eye" style="position:absolute;top:8px;left:calc(50% + 14px)"></span>',
    eyesStyle: "top:0;left:0;right:0;height:30px;",
  },
  bunny: {
    top: '<span class="ear ear-l"></span><span class="ear ear-r"></span>',
    bottom: '<span class="foot"></span><span class="foot"></span>',
    eyes: '<span class="eye" style="position:absolute;top:8px;left:calc(50% - 18px)"></span><span class="eye" style="position:absolute;top:8px;left:calc(50% + 12px)"></span>',
    eyesStyle: "top:0;left:0;right:0;height:30px;",
  },
  dino: {
    top: '<span class="spike spike-1"></span><span class="spike spike-2"></span><span class="spike spike-3"></span>',
    bottom: '<span class="foot"></span><span class="foot"></span>',
    eyes: '<span class="eye" style="position:absolute;top:8px;left:calc(50% - 20px)"></span><span class="eye" style="position:absolute;top:8px;left:calc(50% + 14px)"></span>',
    eyesStyle: "top:0;left:0;right:0;height:30px;",
  },
  frog: {
    top: '<span class="eye-bump eye-bump-l"></span><span class="eye-bump eye-bump-r"></span>',
    bottom: '<span class="foot"></span><span class="foot"></span>',
    eyes: "",
    eyesStyle: "",
  },
  jar: {
    top: '<span class="jar-cap-spark spark-left"></span><span class="jar-cap-spark spark-right"></span><span class="jar-mini-charm"></span>',
    bottom: '<span class="jar-ball ball-pink"></span><span class="jar-ball ball-yellow"></span><span class="jar-ball ball-blue"></span><span class="jar-ball ball-purple"></span>',
    eyes: '<span class="jar-heart heart-left"></span><span class="jar-heart heart-right"></span>',
    eyesStyle: "top:10px;left:0;right:0;height:40px;",
  },
  laptop: {
    top: '<span class="laptop-cam"></span><span class="laptop-led"></span><span class="laptop-side-sticker sticker-left-heart"></span><span class="laptop-side-sticker sticker-right-star"></span>',
    bottom: '<span class="laptop-base"></span><span class="laptop-pad"></span>',
    eyes: "",
    eyesStyle: "",
  },
  balletcore: {
    top: '<span class="ribbon ribbon-l">🎀</span><span class="ribbon ribbon-r">🎀</span><span class="lace-trim"></span>',
    bottom: '<span class="pearl-chain"></span><span class="mini-bow">🎀</span>',
    eyes: "",
    eyesStyle: "",
  },
  devilCat: {
    top: '<span class="cross-charm">†</span>',
    bottom: '<span class="devil-paw paw-l"></span><span class="devil-tail"></span><span class="devil-paw paw-r"></span>',
    eyes: '<span class="star-eye" style="position:absolute;top:8px;left:calc(50% - 28px)">✦</span><span class="star-eye" style="position:absolute;top:8px;left:calc(50% + 18px)">✦</span>',
    eyesStyle: "top:0;left:0;right:0;height:30px;color:#ff2a6d;text-shadow:0 0 5px #ff2a6d;",
  },
  cherryCake: {
    top: '<span class="cream-piping"></span><span class="cherry cherry-l">🍒</span><span class="cherry cherry-r">🍒</span>',
    bottom: '<span class="cream-piping-bottom"></span><span class="sprinkles"></span>',
    eyes: "",
    eyesStyle: "",
  },
};

/* ===== YouTube URL Parsing ===== */
function parseVideoId(raw) {
  try {
    const input = raw.trim();
    if (!input) return null;

    // Handle embed URLs
    if (input.includes("/embed/")) {
      const url = new URL(input);
      const parts = url.pathname.split("/");
      return parts[parts.length - 1] || null;
    }

    const url = new URL(input);

    // youtu.be short links
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "") || null;
    }

    // youtube.com
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;

      // shorts
      if (url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/")[2] || null;
      }

      // live
      if (url.pathname.startsWith("/live/")) {
        return url.pathname.split("/")[2] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function buildEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

function buildWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}&autoplay=1&app=desktop&persist_app=1`;
}

/* ===== Video Loading ===== */
let currentVideoId = null;

function loadVideo() {
  const videoId = parseVideoId(urlInput.value);
  if (!videoId) {
    urlInput.style.borderColor = "#ff6b6b";
    setTimeout(() => { urlInput.style.borderColor = ""; }, 800);
    urlInput.focus();
    urlInput.select();
    return;
  }

  currentVideoId = videoId;
  currentVideoUrl = buildWatchUrl(videoId);
  playerView.src = currentVideoUrl;
  welcomeScreen.classList.add("hidden");
  toggleSettings(false);
}

/* ===== Skin Management ===== */
const frameImage = document.getElementById("frameImage");
let customSkins = {}; // id -> skin data

function setSkin(name) {
  // Remove old skin classes
  frame.className = frame.className.replace(/skin-\w+/g, "").trim();
  frameImage.style.display = "none";

  const custom = customSkins[name];
  const screenArea = document.querySelector(".screen-area");
  if (custom) {
    // Image-based custom skin
    frame.classList.add("skin-custom");
    frame.dataset.skin = name;
    frameImage.style.display = "block";
    frameImage.style.backgroundImage = `url("file://${custom.framePath}")`;

    // Use percentage-based positioning so insets scale with frame size
    const inset = custom.videoInset;
    const imgW = custom.imageSize[0];
    const imgH = custom.imageSize[1];
    const pctTop = (inset.top / imgH * 100).toFixed(2);
    const pctRight = (inset.right / imgW * 100).toFixed(2);
    const pctBottom = (inset.bottom / imgH * 100).toFixed(2);
    const pctLeft = (inset.left / imgW * 100).toFixed(2);
    screenArea.style.position = "absolute";
    screenArea.style.top = `${pctTop}%`;
    screenArea.style.right = `${pctRight}%`;
    screenArea.style.bottom = `${pctBottom}%`;
    screenArea.style.left = `${pctLeft}%`;
    screenArea.style.padding = "";
    screenArea.style.flex = "";
    screenArea.style.overflow = "hidden";
    screenArea.style.borderRadius = "12px";
  } else {
    // Built-in CSS skin
    frame.classList.add(`skin-${name}`);
    frame.dataset.skin = name;
    screenArea.style.position = "";
    screenArea.style.top = "";
    screenArea.style.right = "";
    screenArea.style.bottom = "";
    screenArea.style.left = "";
    screenArea.style.padding = "";
    screenArea.style.flex = "";
    screenArea.style.overflow = "";
    screenArea.style.borderRadius = "";

    const deco = skinDecorations[name] || skinDecorations.frog;
    decoTop.innerHTML = deco.top;
    decoBottom.innerHTML = deco.bottom;
    decoEyes.innerHTML = deco.eyes;
    decoEyes.style.cssText = deco.eyesStyle;
  }

  // Update active button
  document.querySelectorAll(".skin-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.skin === name);
  });
}

/* ===== Settings Panel ===== */
function toggleSettings(force) {
  settingsOpen = typeof force === "boolean" ? force : !settingsOpen;
  settingsPanel.classList.toggle("is-open", settingsOpen);
  settingsPanel.setAttribute("aria-hidden", String(!settingsOpen));
  if (settingsOpen) urlInput.focus();
}

/* ===== Scale / Zoom ===== */
// Chrome = non-video space (app padding + frame border)
const CHROME_W = 14 * 2 + 4 * 2;  // app padding L/R + frame border L/R
const CHROME_H = 48 + 14 + 4 * 2 + 14; // app padding top + bottom + frame border T/B + drag bar
const BASE_VIDEO_W = 480 - CHROME_W;
const ZOOM_STEP = 0.12;
const MIN_VIDEO_W = 240;

function videoWtoWindowSize(vw) {
  const vh = Math.round(vw * 9 / 16);
  return { width: vw + CHROME_W, height: vh + CHROME_H };
}

async function refreshScale() {
  const bounds = await window.miniViewer.getWindowBounds();
  if (!bounds) return;
  const videoW = bounds.width - CHROME_W;
  const pct = Math.round((videoW / BASE_VIDEO_W) * 100);
  scaleLabel.textContent = `${pct}%`;
}

async function refreshOpacity() {
  const value = await window.miniViewer.getOpacity();
  if (typeof value !== "number") return;
  const pct = Math.round(value * 100);
  opacitySlider.value = String(pct);
  opacityLabel.textContent = `${pct}%`;
}

async function setOpacityFromSlider() {
  const pct = Number(opacitySlider.value || 100);
  const next = await window.miniViewer.setOpacity(pct / 100);
  const nextPct = Math.round(next * 100);
  opacitySlider.value = String(nextPct);
  opacityLabel.textContent = `${nextPct}%`;
}

async function zoom(direction) {
  const bounds = await window.miniViewer.getWindowBounds();
  if (!bounds) return;

  const currentVideoW = bounds.width - CHROME_W;
  const mul = direction > 0 ? 1 + ZOOM_STEP : 1 - ZOOM_STEP;
  const newVideoW = Math.max(MIN_VIDEO_W, Math.round(currentVideoW * mul));
  const size = videoWtoWindowSize(newVideoW);

  await window.miniViewer.setWindowSize(size);
  setTimeout(() => { pokeLayout(playerView); refreshScale(); }, 100);
}

/* ===== Pin Toggle ===== */
async function refreshPin() {
  const isOn = await window.miniViewer.getAlwaysOnTop();
  const btn = document.getElementById("btnPin");
  btn.classList.toggle("pin-on", isOn);
  btn.classList.toggle("pin-off", !isOn);
  btn.textContent = isOn ? "📌 고정" : "📌 해제";
}

/* ===== Resize Handle ===== */
function startResize(e) {
  e.preventDefault();
  e.stopPropagation();

  window.miniViewer.getWindowBounds().then((bounds) => {
    if (!bounds) return;
    resizeState = {
      startX: e.screenX,
      startY: e.screenY,
      startW: bounds.width,
      startH: bounds.height,
    };
    document.body.classList.add("is-resizing");
  });
}

function doResize(e) {
  if (!resizeState) return;
  const newW = resizeState.startW + (e.screenX - resizeState.startX);
  const videoW = Math.max(MIN_VIDEO_W, newW - CHROME_W);
  const size = videoWtoWindowSize(videoW);
  window.miniViewer.setWindowSize(size);
}

function endResize() {
  if (!resizeState) return;
  resizeState = null;
  document.body.classList.remove("is-resizing");
  refreshScale();
}

/* ===== Clean Mode (Right-click fullscreen) ===== */
function enterCleanMode() {
  if (cleanMode || !currentVideoId) return;
  cleanMode = true;

  // Load embed URL in clean view for fullscreen
  cleanView.src = buildEmbedUrl(currentVideoId);
  cleanOverlay.style.display = "block";

  // Show hint briefly
  cleanHint.classList.remove("fade");
  setTimeout(() => cleanHint.classList.add("fade"), 2000);

  window.miniViewer.enterCleanMode();
}

function exitCleanMode() {
  if (!cleanMode) return;
  cleanMode = false;

  cleanOverlay.style.display = "none";
  cleanView.src = "about:blank";

  window.miniViewer.exitCleanMode();
}

/* ===== Inject CSS + JS into webview ===== */
function injectViewerCSS(view) {
  const css = `
    html, body {
      background: #000 !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      overflow: hidden !important;
    }
    body::-webkit-scrollbar { display: none !important; }

    /* Hide page chrome - NOT player controls */
    #masthead-container, ytd-masthead,
    ytd-mini-guide-renderer, #guide, #guide-button,
    #secondary, #comments, #below, #related,
    #info, #meta, ytd-watch-metadata, #above-the-fold, #bottom-row,
    #panels, #panels-full-bleed-container,
    ytd-engagement-panel-section-list-renderer,
    #description, #subscribe-button,
    .ytp-ce-element, .ytp-pause-overlay,
    .iv-branding, .annotation { display: none !important; }

    /* Remove masthead offset and fill viewport */
    #page-manager, ytd-page-manager { margin-top: 0 !important; }
    ytd-app { --ytd-masthead-height: 0px !important; }
    ytd-watch-flexy {
      --ytd-watch-flexy-min-width: 0px !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
      left: 0 !important;
      max-height: 100vh !important;
    }

    #primary, #primary-inner, #columns, #content, #full-bleed-container,
    #player-container, #player, #ytd-player {
      margin: 0 !important;
      padding: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
      left: 0 !important;
    }

    /* Force player to fill entire viewport */
    #player-theater-container, #player-wide-container,
    #full-bleed-container, #player-full-bleed-container {
      max-height: 100vh !important;
      height: 100vh !important;
      min-height: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #movie_player, .html5-video-player {
      width: 100% !important;
      height: 100vh !important;
      max-height: 100vh !important;
      margin: 0 auto !important;
      left: 0 !important;
      right: 0 !important;
    }

    .html5-video-container, video {
      width: 100% !important;
      height: 100% !important;
      left: 0 !important;
      right: 0 !important;
      margin: 0 auto !important;
      object-position: center center !important;
    }

    video { object-fit: contain !important; }
  `;
  view.insertCSS(css).catch(() => {});
}

function pokeLayout(view) {
  const script = `(() => {
    // Trigger theater mode for larger player
    const wf = document.querySelector('ytd-watch-flexy');
    if (wf && !wf.hasAttribute('theater')) {
      const btn = document.querySelector('.ytp-size-button');
      if (btn) btn.click();
    }
    // Resize player to fill viewport
    const p = document.querySelector('#movie_player');
    if (p && typeof p.setSize === 'function') {
      p.setSize(window.innerWidth, window.innerHeight);
    }
    window.dispatchEvent(new Event('resize'));
  })()`;
  view.executeJavaScript(script).catch(() => {});
}

/* ===== Event Listeners ===== */

// Load button
document.getElementById("btnLoad").addEventListener("click", loadVideo);
urlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") loadVideo(); });

// Back button - navigate back in webview history
document.getElementById("btnBack").addEventListener("click", () => {
  if (playerView.canGoBack()) playerView.goBack();
});

// Settings toggle
document.getElementById("btnSettings").addEventListener("click", () => toggleSettings());
document.getElementById("btnPanelClose").addEventListener("click", () => toggleSettings(false));

// Window controls
document.getElementById("btnMinimize").addEventListener("click", () => window.miniViewer.minimize());
document.getElementById("btnClose").addEventListener("click", () => window.miniViewer.close());
document.getElementById("btnPin").addEventListener("click", async () => {
  await window.miniViewer.toggleAlwaysOnTop();
  refreshPin();
});

// Zoom
document.getElementById("btnZoomOut").addEventListener("click", () => zoom(-1));
document.getElementById("btnZoomIn").addEventListener("click", () => zoom(1));
opacitySlider.addEventListener("input", () => { setOpacityFromSlider(); });

// YouTube Home - browse YouTube directly
document.getElementById("btnYouTube").addEventListener("click", () => {
  playerView.src = "https://www.youtube.com/";
  welcomeScreen.classList.add("hidden");
  toggleSettings(false);
});

// YouTube Login / Logout
const btnLogin = document.getElementById("btnLogin");

async function refreshLoginStatus() {
  const loggedIn = await window.miniViewer.checkLogin();
  btnLogin.textContent = loggedIn ? "🔓 YouTube 로그아웃" : "🔑 YouTube 로그인";
  btnLogin.dataset.loggedIn = loggedIn;
}

btnLogin.addEventListener("click", async () => {
  if (btnLogin.dataset.loggedIn === "true") {
    await window.miniViewer.logout();
    refreshLoginStatus();
  } else {
    window.miniViewer.openLogin();
  }
});

// Refresh login status when login window closes
window.miniViewer.onLoginStatusChanged(() => refreshLoginStatus());

// Skin buttons
document.querySelectorAll(".skin-btn").forEach((btn) => {
  btn.addEventListener("click", () => setSkin(btn.dataset.skin));
});

// Close panel on outside click
document.addEventListener("click", (e) => {
  if (!settingsOpen) return;
  if (settingsPanel.contains(e.target)) return;
  if (e.target.id === "btnSettings" || e.target.closest("#btnSettings")) return;
  toggleSettings(false);
});

// Right-click on frame border = clean mode (not on video itself)
frame.addEventListener("contextmenu", (e) => {
  // Only trigger if clicking on the frame border area, not inside screen
  if (e.target.closest(".screen-area") || e.target.closest(".settings-panel")) return;
  e.preventDefault();
  enterCleanMode();
});

// Right-click on clean overlay = exit clean mode
cleanOverlay.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  exitCleanMode();
});

// Resize handle
resizeHandle.addEventListener("mousedown", startResize);
window.addEventListener("mousemove", doResize);
window.addEventListener("mouseup", endResize);
window.addEventListener("blur", endResize);

// Webview events - only inject watch-mode CSS on video pages
let watchCssKey = null;
function onPlayerNavigate() {
  const url = playerView.getURL();
  if (url.includes("/watch")) {
    injectViewerCSS(playerView);
    // Lock scrolling on watch pages - save key to remove later
    playerView.insertCSS("html, body { overflow: hidden !important; }")
      .then(key => { watchCssKey = key; })
      .catch(() => {});
    setTimeout(() => pokeLayout(playerView), 1500);
  } else {
    // Restore scrolling on non-watch pages (home, search, etc.)
    if (watchCssKey) {
      playerView.removeInsertedCSS(watchCssKey).catch(() => {});
      watchCssKey = null;
    }
    // Force restore scroll in case removeInsertedCSS isn't enough
    playerView.insertCSS("html, body { overflow: auto !important; overflow-x: hidden !important; }").catch(() => {});
  }
  welcomeScreen.classList.add("hidden");
}

playerView.addEventListener("dom-ready", onPlayerNavigate);
playerView.addEventListener("did-navigate", onPlayerNavigate);
playerView.addEventListener("did-navigate-in-page", onPlayerNavigate);

cleanView.addEventListener("dom-ready", () => {
  injectViewerCSS(cleanView);
  setTimeout(() => pokeLayout(cleanView), 1500);
});

// Window resize - also resize the player
window.addEventListener("resize", () => {
  pokeLayout(playerView);
  refreshScale();
});

/* ===== Init ===== */
setSkin("frog");
refreshPin();
refreshScale();
refreshOpacity();
refreshLoginStatus();
