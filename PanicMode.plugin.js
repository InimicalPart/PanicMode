/**
 * @name PanicMode
 * @author Inimi
 * @authorId 814623079346470993
 * @version 1.0.5
 * @description Disables/Enables all plugins and your theme with a hotkey.
 *
 * @source
 * @website http://inimicalpart.com
 * @donate https://www.paypal.me/inimicalpart
 */

let activeThemes = [];
let settings = null;
let currentObj = null;
function areAnyPluginsActive() {
  for (let i of BdApi.Plugins.getAll()) {
    if (i.name === "BDFDB") continue;
    if (BdApi.Plugins.isEnabled(i.name)) {
      return true;
    }
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
  activePlugins = [];
  for (let i of BdApi.Plugins.getAll()) {
    if (BdApi.Plugins.isEnabled(i.name)) {
      activePlugins.push(i.name);
    }
  }
}
function changePlugins(state) {
  if (state === "disable") {
    getActivePlugins();
  }
  for (let i of activePlugins) {
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
  if (areAnyPluginsActive() || areAnyThemesActive()) {
    changePlugins("disable");
    changeThemes("disable");
    BdApi.showToast("Panic Mode enabled.", {
      type: "success",
      timeout: 1500,
    });
  } else {
    changePlugins("enable");
    changeThemes("enable");
    BdApi.showToast("Panic Mode disabled.", {
      type: "success",
    });
  }
}
function KeyPress(e) {
  if (!currentObj) currentObj = panicKeySetting();
  var evtobj = window.event ? event : e;
  if (
    evtobj.key === currentObj.finalKey &&
    evtobj.ctrlKey === currentObj.ctrlNeeded &&
    evtobj.altKey === currentObj.altNeeded &&
    evtobj.shiftKey === currentObj.shiftNeeded
  ) {
    togglePanic();
  }
}
function panicKeySetting() {
  let panicKey = settings.panicKey;
  try {
    panicKey = panicKey.split("+");
    for (let key in panicKey) {
      panicKey[key] = panicKey[key].toUpperCase().trim();
    }
    let final = {
      finalKey: "",
      ctrlNeeded: false,
      altNeeded: false,
      shiftNeeded: false,
    };
    for (key in panicKey) {
      if (panicKey[key] === "CTRL") {
        final.ctrlNeeded = true;
      } else if (panicKey[key] === "ALT") {
        final.altNeeded = true;
      } else if (panicKey[key] === "SHIFT") {
        final.shiftNeeded = true;
      } else {
        if (panicKey[key].length === 1) {
          final.finalKey = panicKey[key];
        } else {
          return false;
        }
      }
    }
    return final;
  } catch (e) {
    console.log(e);
    return false;
  }
}
ZeresPluginLibrary = global.ZeresPluginLibrary;
module.exports = class PanicMode {
  start() {
    document.addEventListener("keypress", KeyPress);
  }
  stop() {
    document.removeEventListener("keypress", KeyPress);
  }
  load() {
    this.defaultSettings = {
      panicKey: "CTRL+ALT+P",
    };
    if (!global.ZeresPluginLibrary) {
      BdApi.showConfirmationModal(
        "Library Missing",
        `The library plugin needed for PanicMode is missing. Please click Download Now to install it.`,
        {
          confirmText: "Download Now",
          cancelText: "Cancel",
          onConfirm: () => {
            require("request").get(
              "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
              async (error, response, body) => {
                if (error)
                  return require("electron").shell.openExternal(
                    "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                  );
                await new Promise((r) =>
                  require("fs").writeFile(
                    require("path").join(
                      BdApi.Plugins.folder,
                      "0PluginLibrary.plugin.js"
                    ),
                    body,
                    r
                  )
                );
              }
            );
          },
        }
      );
    }
    this.settings = ZeresPluginLibrary.PluginUtilities.loadSettings(
      "PanicMode",
      this.defaultSettings
    );
    settings = this.settings;
    currentObj = panicKeySetting();
  }
  getSettingsPanel() {
    const list = [];
    function buildSetting(data) {
      const { id } = data;
      console.log(id);
      const setting = global.XenoLib.buildSetting(data);
      console.log(setting);
      if (id) setting.getElement().id = id;
      return setting;
    }
    async function verifySetting(value, id) {
      if (id === "panicKey") {
        let panicKey = value;
        let keyPresent = false;
        try {
          if (panicKey.startsWith("+") || panicKey.endsWith("+")) {
            return false;
          }
          panicKey = panicKey.split("+");
          if (panicKey.length < 1 || panicKey.length > 4) {
            return false;
          }
          for (key in panicKey) {
            panicKey[key] = panicKey[key].toUpperCase().trim();
          }
          for (key in panicKey) {
            if (
              panicKey[key] !== "CTRL" &&
              panicKey[key] !== "ALT" &&
              panicKey[key] !== "SHIFT"
            ) {
              if (keyPresent) return false;
              if (panicKey[key].length !== 1) {
                return false;
              } else {
                keyPresent = true;
              }
            }

            return true;
          }
        } catch (e) {
          console.log(e);
          return false;
        }
      }
    }
    function createSetting(data) {
      const current = Object.assign({}, data);
      if (!current.onChange) {
        current.onChange = async (value) => {
          if (await verifySetting(value, current.id)) {
            this.settings[current.id] = value.toUpperCase();
            settings = this.settings;
            currentObj = panicKeySetting();
            if (current.callback) current.callback(value);
          } else {
            console.log("invalid");
          }
        };
      }
      if (typeof current.value === "undefined")
        current.value = this.settings[current.id];
      console.log(data, current);
      return this.buildSetting(current);
    }
    this.buildSetting = buildSetting;
    this.createSetting = createSetting;

    list.push(
      this.createSetting({
        name: "Panic Key",
        note: "Type something like 'Ctrl+Alt+P'",
        id: "panicKey",
        type: "textbox",
      })
    );
    return ZeresPluginLibrary.Settings.SettingPanel.build(
      (_) =>
        ZeresPluginLibrary.PluginUtilities.saveSettings(
          "PanicMode",
          this.settings
        ),
      ...list
    );
  }
};
