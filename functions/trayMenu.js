const { Menu } = require('electron')
const { screenshotFullscreen, screenshotSelection, screenshotWindow } = require('./commands')
const { openSettings, openShorten } = require('./pages')
function trayMenu (config) {
  return Menu.buildFromTemplate([
    {
      label: 'Capture Full Screen',
      accelerator: config.c_fs,
      click: screenshotFullscreen
    },
    {
      label: 'Capture Selection',
      accelerator: config.c_s,
      click: screenshotSelection
    },
    {
      label: 'Capture Window',
      accelerator: config.c_w,
      click: screenshotWindow
    },
    {
      label: 'Shorten Link',
      accelerator: config.s_u,
      click: openShorten
    },
    { type: 'separator' },
    {
      label: 'Settings',
      accelerator: config.o_se,
      click: openSettings
    },
    { type: 'separator' },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      selector: 'terminate:'
    }
  ])
}

module.exports = trayMenu
