const { app, BrowserWindow, ipcMain, shell, session } = require("electron");
const path = require("path");

let mainWindow;
let isCleanMode = false;
let savedBounds = null;

function getWindowIconPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "build", "r-icon.ico");
  }
  return path.join(__dirname, "build", "r-icon.ico");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 334,
    minWidth: 276,
    minHeight: 219,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: true,
    maximizable: false,
    skipTaskbar: false,
    title: "미니 유튜브",
    icon: getWindowIconPath(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.nonna.miniyoutuberviewer");
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Window controls
ipcMain.handle("window:minimize", () => mainWindow?.minimize());
ipcMain.handle("window:close", () => mainWindow?.close());

ipcMain.handle("window:toggle-always-on-top", () => {
  if (!mainWindow) return false;
  const next = !mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(next, "screen-saver");
  return next;
});

ipcMain.handle("window:get-always-on-top", () => {
  return mainWindow?.isAlwaysOnTop() ?? true;
});

ipcMain.handle("window:get-bounds", () => {
  return mainWindow?.getBounds() ?? null;
});

ipcMain.handle("window:get-opacity", () => {
  return mainWindow?.getOpacity?.() ?? 1;
});

ipcMain.handle("window:set-opacity", (_e, value) => {
  if (!mainWindow || typeof value !== "number") return 1;
  const next = Math.min(1, Math.max(0.2, value));
  if (typeof mainWindow.setOpacity === "function") {
    mainWindow.setOpacity(next);
  }
  return next;
});

ipcMain.handle("window:set-size", (_e, payload) => {
  if (!mainWindow || !payload) return;
  const w = Math.max(276, Math.round(payload.width));
  const h = Math.max(219, Math.round(payload.height));
  // Use setBounds instead of setSize - fixes shrink issue on Windows transparent windows
  const currentBounds = mainWindow.getBounds();
  mainWindow.setBounds({ x: currentBounds.x, y: currentBounds.y, width: w, height: h });
});

// Clean mode (right-click fullscreen): hide frame, show only video
ipcMain.handle("window:enter-clean-mode", () => {
  if (!mainWindow || isCleanMode) return false;
  savedBounds = mainWindow.getBounds();
  isCleanMode = true;
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  return true;
});

ipcMain.handle("window:exit-clean-mode", () => {
  if (!mainWindow || !isCleanMode) return false;
  isCleanMode = false;
  if (savedBounds) {
    mainWindow.setBounds(savedBounds, true);
    savedBounds = null;
  }
  return true;
});

ipcMain.handle("window:is-clean-mode", () => isCleanMode);

ipcMain.handle("shell:open-external", (_e, url) => {
  if (typeof url === "string" && url.startsWith("http")) {
    shell.openExternal(url);
  }
});

// YouTube login in a separate window sharing the same session
ipcMain.handle("window:open-login", () => {
  const loginWin = new BrowserWindow({
    width: 480,
    height: 640,
    parent: mainWindow,
    modal: false,
    autoHideMenuBar: true,
    title: "YouTube 로그인",
    webPreferences: {
      partition: "persist:youtube",
    },
  });
  loginWin.loadURL("https://accounts.google.com/ServiceLogin?service=youtube&continue=https://www.youtube.com/");
  // When login window closes, notify renderer to refresh login status
  loginWin.on("closed", () => {
    mainWindow?.webContents.send("login-status-changed");
  });
});

// Check YouTube login status
ipcMain.handle("window:check-login", async () => {
  const ses = session.fromPartition("persist:youtube");
  const cookies = await ses.cookies.get({ domain: ".youtube.com", name: "SID" });
  return cookies.length > 0;
});

// YouTube logout - clear session cookies
ipcMain.handle("window:logout", async () => {
  const ses = session.fromPartition("persist:youtube");
  await ses.clearStorageData({ storages: ["cookies"] });
});
