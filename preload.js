const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("miniViewer", {
  minimize: () => ipcRenderer.invoke("window:minimize"),
  close: () => ipcRenderer.invoke("window:close"),
  toggleAlwaysOnTop: () => ipcRenderer.invoke("window:toggle-always-on-top"),
  getAlwaysOnTop: () => ipcRenderer.invoke("window:get-always-on-top"),
  getWindowBounds: () => ipcRenderer.invoke("window:get-bounds"),
  getOpacity: () => ipcRenderer.invoke("window:get-opacity"),
  setOpacity: (value) => ipcRenderer.invoke("window:set-opacity", value),
  setWindowSize: (size) => ipcRenderer.invoke("window:set-size", size),
  enterCleanMode: () => ipcRenderer.invoke("window:enter-clean-mode"),
  exitCleanMode: () => ipcRenderer.invoke("window:exit-clean-mode"),
  isCleanMode: () => ipcRenderer.invoke("window:is-clean-mode"),
  openExternal: (url) => ipcRenderer.invoke("shell:open-external", url),
  openLogin: () => ipcRenderer.invoke("window:open-login"),
  checkLogin: () => ipcRenderer.invoke("window:check-login"),
  logout: () => ipcRenderer.invoke("window:logout"),
  onLoginStatusChanged: (cb) => ipcRenderer.on("login-status-changed", cb),
});
