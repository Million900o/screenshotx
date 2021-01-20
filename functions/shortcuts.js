const { globalShortcut } = require('electron')

const { screenshotFullscreen, screenshotSelection, screenshotWindow } = require('./commands')
const x = require('./pages')

// For all of the shortcuts, register the functions
function registerShortcuts (conf) {
  globalShortcut.register(conf.c_fs, screenshotFullscreen)
  globalShortcut.register(conf.c_s, screenshotSelection)
  globalShortcut.register(conf.c_w, screenshotWindow)
  globalShortcut.register(conf.o_se, x.openSettings)
  globalShortcut.register(conf.s_u, x.openShorten)
}

module.exports = registerShortcuts
