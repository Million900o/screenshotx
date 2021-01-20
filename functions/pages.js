const { app, BrowserWindow, clipboard, ipcMain } = require('electron')
const settings = require('electron-settings')
const path = require('path')

const registerShortcuts = require('./shortcuts')
const shortenURL = require('./shortenURL')

// Define variables
let shortenWin = null
let settingsWin = null

// Open settings
async function openSettings () {
  // If settings already open, show it
  if (settingsWin) return settingsWin.show()
  // Otherwise make it a new window
  settingsWin = new BrowserWindow({
    show: false,
    title: 'ScreenShotX',
    width: 600,
    height: 500,
    resizeable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // Load the settings html
  settingsWin.loadURL('file://' + path.join(__dirname, '/../static/pages/settings.html'))

  // When it loads, send the settings and show the window
  settingsWin.webContents.on('dom-ready', () => {
    settingsWin.webContents.send('settings:start', settings.get('config'))
    settingsWin.show()
    app.dock.show()
  })

  // When it closes just set the variable back to null
  settingsWin.on('closed', () => {
    settingsWin = null
  })
}

// Open Shorten page
async function openShorten () {
  // If it is already open, show it
  if (shortenWin) return shortenWin.show()
  // Otherwise make a new window
  shortenWin = new BrowserWindow({
    show: true,
    title: 'Shorten URL',
    width: 500,
    height: 70,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // Load the shorten html
  shortenWin.loadURL('file://' + path.join(__dirname, '/../static/pages/shorten.html'))

  // When it loads, send the url for preset and show the window
  shortenWin.webContents.on('dom-ready', () => {
    shortenWin.webContents.send('shorten:start', clipboard.readText())
    shortenWin.show()
    app.dock.show()
  })

  // When it closes just set the variable back to null
  shortenWin.on('closed', () => {
    shortenWin = null
  })
}

// When the IPC receives a shorten event, close the window and shorten the URL
ipcMain.on('shorten:shorten', (e, url) => {
  if (shortenWin) shortenWin.close()
  shortenURL(url)
})

// When the IPC recieves a settings update event, save the new settings
ipcMain.on('settings:update', async (e, item) => {
  registerShortcuts(item)
  settings.set('config', item)
})

// IDK, "module.exports = { openSettings, openShorten };" didn't work for whatever reason
module.exports.openSettings = openSettings
module.exports.openShorten = openShorten
