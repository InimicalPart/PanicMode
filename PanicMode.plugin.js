/**
 * @name PanicMode
 * @author Inimi
 * @authorId 814623079346470993
 * @version 1.1.1
 * @description Disables/Enables all plugins and your theme with a hotkey.
 *
 * @source https://github.com/InimicalPart/PanicMode/blob/main/PanicMode.plugin.js
 * @updateUrl https://raw.githubusercontent.com/InimicalPart/PanicMode/main/PanicMode.plugin.js
 * @website http://inimicalpart.com
 * @donate https://www.paypal.me/inimicalpart
 */

/*@cc_on
@if (@_jscript)
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();
@else@*/

let activeThemes = [];
let activePluginsNames = [];
let activePluginsIds = [];
let settings = null;
let currentObj = null;
let panicMode = false;
const config = {
  info: {
    name: "PanicMode",
    authors: [
      {
        name: "Inimi",
        discord_id: "814623079346470993",
        github_username: "Inimi",
      },
    ],
    version: "1.0.9",
    description: "Disables/Enables all plugins and your theme with a hotkey.",
    github: "https://github.com/InimicalPart",
    github_raw:
      "https://raw.githubusercontent.com/InimicalPart/PanicMode/main/PanicMode.plugin.js",
  },
  changelog: [
    {
      title: "Fixed",
      type: "fixed",
      items: ["Removed unnecessary console.logs"],
    },
  ],
};
function areAnyPluginsActive() {
  let active = [];
  for (let i of BdApi.Plugins.getAll()) {
    if (
      i.name === "BDFDB" ||
      i.name === config.info.name ||
      i.id === "BDFDB" ||
      i.id === config.info.name
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
async function getActivePlugins() {
  activePluginsNames = [];
  activePluginsIds = [];
  for (let i of BdApi.Plugins.getAll()) {
    if (
      i.name === "BDFDB" ||
      i.name === config.info.name ||
      i.id === "BDFDB" ||
      i.id === config.info.name
    )
      continue;
    if (BdApi.Plugins.isEnabled(i.name)) {
      activePluginsNames.push(i.name);
    } else if (BdApi.Plugins.isEnabled(i.id)) {
      activePluginsIds.push(i.id);
    }
  }
}
async function changePlugins(state) {
  if (state === "disable") {
    await getActivePlugins();
  }
  for (let i of activePluginsNames) {
    if (i === "BDFDB" || i === config.info.name) continue;
    if (state === "enable") {
      BdApi.Plugins.enable(i);
    } else {
      BdApi.Plugins.disable(i);
    }
  }
  for (let i of activePluginsIds) {
    if (i === "BDFDB" || i === config.info.name) continue;
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
  if (typeof areAnyPluginsActive() === "object" || areAnyThemesActive()) {
    panicMode = true;
    changePlugins("disable");
    changeThemes("disable");
    BdApi.showToast("Panic Mode enabled.", {
      type: "success",
      timeout: 1500,
    });
  } else {
    if (!panicMode) {
      return BdApi.showToast(
        "No plugins or themes are active. Can't enable Panic Mode.",
        {
          type: "error",
        }
      );
    }
    panicMode = false;
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
    evtobj.code === "Key" + currentObj.finalKey.toUpperCase() &&
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
  config = config;
  start() {
    document.addEventListener("keypress", KeyPress);
  }
  stop() {
    document.removeEventListener("keypress", KeyPress);
  }
  load() {
    this.defaultSettings = {
      panicKey: "CTRL+ALT+P",
      seenChangelogForVersion: "",
    };
    // if (!bdApi.Plugins.isEnabled("XenoLib") || !bdApi.Plugins.isEnabled("ZeresPluginLibrary")) {
    // BdApi.Plugins.enable("XenoLib");
    // BdApi.Plugins.enable("ZeresPluginLibrary");
    // }
    if (!global.ZeresPluginLibrary || !global.XenoLib) {
      BdApi.showConfirmationModal(
        "Library Missing",
        `Some required plugins that are needed for ${config.info.name} are missing. Please click Download Now to install them.`,
        {
          confirmText: "Download Now",
          cancelText: "Cancel",
          onConfirm: () => {
            if (!global.ZeresPluginLibrary) {
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
            }
            if (!global.XenoLib) {
              require("request").get(
                "https://raw.githubusercontent.com/1Lighty/BetterDiscordPlugins/master/Plugins/1XenoLib.plugin.js",
                async (error, response, body) => {
                  if (error)
                    return require("electron").shell.openExternal(
                      "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/1Lighty/BetterDiscordPlugins/master/Plugins/1XenoLib.plugin.js"
                    );
                  await new Promise((r) =>
                    require("fs").writeFile(
                      require("path").join(
                        BdApi.Plugins.folder,
                        "1XenoLib.plugin.js"
                      ),
                      body,
                      r
                    )
                  );
                }
              );
            }
          },
          onCancel: () => {
            BdApi.showToast(
              "Plugin will not load without the required plugins.",
              {
                type: "error",
              }
            );
            BdApi.Plugins.disable(config.info.name);
          },
        }
      );
    }
    ZeresPluginLibrary.PluginUpdater.checkForUpdate(
      config.info.name,
      config.info.version,
      "https://raw.githubusercontent.com/InimicalPart/PanicMode/main/PanicMode.plugin.js"
    );
    this.settings = ZeresPluginLibrary.PluginUtilities.loadSettings(
      config.info.name,
      this.defaultSettings
    );
    settings = this.settings;
    currentObj = panicKeySetting();
    // ZeresPluginLibrary.buildPlugin(config);
    if (settings.seenChangelogForVersion !== config.info.version) {
      global.XenoLib.showChangelog(
        `${config.info.name} has been updated!`,
        config.info.version,
        config.changelog
      );
      settings.seenChangelogForVersion = config.info.version;
      ZeresPluginLibrary.PluginUtilities.saveSettings(
        config.info.name,
        settings
      );
    }
  }
  getSettingsPanel() {
    const list = [];
    function buildSetting(data) {
      const { id } = data;
      const setting = global.XenoLib.buildSetting(data);
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
            ZeresPluginLibrary.PluginUtilities.saveSettings(
              config.info.name,
              this.settings
            );
            currentObj = panicKeySetting();
            if (current.callback) current.callback(value);
          }
        };
      }
      if (typeof current.value === "undefined")
        current.value = this.settings[current.id];
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
          config.info.name,
          this.settings
        ),
      ...list
    );
  }
};
/*@end@*/
