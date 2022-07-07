/**
 * @name PanicMode
 * @author Inimi
 * @authorId 814623079346470993
 * @version 1.0.4
 * @description Toggles all enabled plugins and themes with a hotkey.
 *
 * @license MIT
 * @website http://inimicalpart.com
 * @donate https://www.paypal.me/inimicalpart
 */

let activeThemes = [];
let activePluginsNames = [];
let activePluginsIds = [];
let panicModeStatus = false;
function areAnyPluginsActive() {
  let active = [];
  for (let i of BdApi.Plugins.getAll()) {
    if (
      i.name === "BDFDB" ||
      i.name === "PanicMode" ||
      i.id === "BDFDB" ||
      i.id === "PanicMode"
    )
      continue;
    if (BdApi.Plugins.isEnabled(i.name)) {
      active.push(i.name);
    } else if (BdApi.Plugins.isEnabled(i.id)) {
      active.push(i.id);
    }
  }
  if (active.length > 0) {
    return [true, active];
  }
  return false;
}
function areAnyThemesActive() {
  for (let i of BdApi.Themes.getAll()) {
    if (BdApi.Themes.isEnabled(i.name)) {
      return true;
    }
  }
  return false;
}
function getActivePlugins() {
  activePluginsNames = [];
  activePluginsIds = [];
  for (let i of BdApi.Plugins.getAll()) {
    if (
      i.id === "BDFDB" ||
      i.id === "PanicMode" ||
      i.name === "BDFDB" ||
      i.name === "PanicMode"
    )
      continue;
    if (BdApi.Plugins.isEnabled(i.nme)) {
      activePluginsNames.push(i.name);
    }
    if (BdApi.Plugins.isEnabled(i.id)) {
      activePluginsIds.push(i.id);
    }
  }
}
function changePlugins(state) {
  if (state === "disable") {
    getActivePlugins();
  }
  for (let i of activePluginsNames) {
    // console.log("NAME: " + i);
    if (i === "BDFDB" || i === "PanicMode") continue;
    if (state === "enable") {
      BdApi.Plugins.enable(i);
    } else {
      BdApi.Plugins.disable(i);
    }
  }
  for (let i of activePluginsIds) {
    // console.log("ID: " + i);
    if (i === "BDFDB" || i === "PanicMode") continue;
    if (state === "enable") {
      BdApi.Plugins.enable(i);
    } else {
      BdApi.Plugins.disable(i);
    }
  }
}
function changeThemes(state) {
  if (state === "disable") {
    getActiveThemes();
  }
  for (let i of activeThemes) {
    if (state === "enable") {
      BdApi.Themes.enable(i);
    } else {
      BdApi.Themes.disable(i);
    }
  }
}
function getActiveThemes() {
  activeThemes = [];
  for (let i of BdApi.Themes.getAll()) {
    if (BdApi.Themes.isEnabled(i.name)) {
      activeThemes.push(i.name);
    }
  }
}
function togglePanic() {
  console.log(panicModeStatus);
  console.log(typeof areAnyPluginsActive() === "object", areAnyThemesActive());
  if (typeof areAnyPluginsActive() === "object" || areAnyThemesActive()) {
    getActivePlugins();
    getActiveThemes();
    console.log(activePluginsIds, activePluginsNames, activeThemes);
    if (
      activePluginsIds.length < 1 &&
      activePluginsNames.length < 1 &&
      activeThemes.length < 1
    ) {
      return BdApi.showToast(
        "No plugins or themes enabled. Can't enable Panic Mode.",
        { type: "error" }
      );
    }
    panicModeStatus = true;
    changePlugins("disable");
    changeThemes("disable");
    BdApi.showToast("Panic Mode enabled.", {
      type: "success",
      timeout: 1500,
    });
  } else {
    if (!panicModeStatus) {
      return BdApi.showToast(
        "No plugins or themes enabled. Can't enable Panic Mode.",
        { type: "error" }
      );
    }
    panicModeStatus = false;
    changePlugins("enable");
    changeThemes("enable");
    BdApi.showToast("Panic Mode disabled.", {
      type: "success",
    });
  }
}
function KeyPress(e) {
  //   console.log(e);
  var evtobj = window.event ? event : e;
  if (evtobj.keyCode == 24 && evtobj.ctrlKey && evtobj.shiftKey) {
    togglePanic();
  }
}
module.exports = class PanicMode {
  start() {
    document.addEventListener("keypress", KeyPress);
  }
  stop() {
    document.removeEventListener("keypress", KeyPress);
  }
};
