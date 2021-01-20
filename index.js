// Dependencies
const { app, Menu, Tray } = require('electron')
const settings = require('electron-settings')
const path = require('path')
const fs = require('fs')

// Functions
const { saveCustom, saveClipboard, saveImgur, saveLocal, savePyroCDN } = require('./functions/saveFiles')
const { customError } = require('./functions/notifications')
const { openSettings } = require('./functions/pages')
const trayMenu = require('./functions/trayMenu')
const template = require('./functions/template')
const registerShortcuts = require('./functions/shortcuts')

// variables
let lastFile = ''
let tray = null

// Globals
global.file = `${app.getPath('home')}/screenshot.png`
global.settingsWin = null
global.shortenWin = null

// Ready
app.on('ready', (e) => {
  // Set Settings
  // settings.deleteAll();
  if (!settings.has('config')) {
    settings.set('config', {
      c_fs: 'Command+7',
      c_s: 'Command+8',
      c_w: 'Command+9',
      o_se: 'Command+Shift+i',
      s_u: 'Command+0',
      save: 'local'
    })
    openSettings()
  } else app.dock.hide()

  fs.watch(app.getPath('home'), {}, (e, s) => {
    if (s === 'screenshot.png' && fs.existsSync(file)) handleFile()
  })

  const conf = settings.get('config')

  // Tray stuff
  tray = new Tray(path.join(__dirname, 'assets/icons/icon.png'))
  tray.setToolTip('ScreenShotX')
  tray.setContextMenu(trayMenu(conf))
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  // Shortcuts
  registerShortcuts(conf)
})

// When window closes hide the dock
app.on('window-all-closed', (e) => {
  e.preventDefault()
  app.dock.hide()
})

// Function to watch the file
function handleFile () {
  // Check if it exists
  const exist = fs.existsSync(file)
  if (!exist) { return customError('The handleFile function was called, but no file exists') }
  // Check if we already did it
  // IK this is inefficient but idk how else to do this
  const check = fs.readFileSync(file).buffer
  // If its the last file, just return
  if (check === lastFile) return
  else lastFile = check

  // Get the settings
  const { save } = settings.get('config')

  // Save the file
  switch (save) {
    case 'clipboard': return saveClipboard()
    case 'imgur': return saveImgur()
    case 'local': return saveLocal()
    case 'custom': return saveCustom()
    case 'PyroCDN': return savePyroCDN()
    default: return customError(`Save method ${save} is not accepted.`)
  }
}

process.on('unhandledRejection', (e) => {
  customError(e.toString())
})
