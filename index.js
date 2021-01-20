// Dependencies
const { app, Menu, Tray } = require('electron');
const settings = require('electron-settings');
const path = require('path');
const fs = require('fs');

// Functions
const { saveCustom, saveClipboard, saveImgur, saveLocal, savePyroCDN } = require('./functions/saveFiles');
const { customError } = require('./functions/notifications');
const { openSettings } = require('./functions/pages');
const trayMenu = require('./functions/trayMenu');
const template = require('./functions/template');
const registerShortcuts = require('./functions/shortcuts');

//variables
let lastFile = '';
let tray = null;

// Globals
global.file = `${app.getPath('home')}/screenshot.png`;
global.settingsWin = null;
global.shortenWin = null;

// Ready
app.on('ready', (e) => {
  // Set Settings
  if (!settings.has('config')) {
    settings.set('config', {
      'save': 'local',
      'c_fs': 'Command+7',
      'c_s': 'Command+8',
      'c_w': 'Command+9',
      's_u': 'Command+0',
      'o_se': 'Command+Shift+i',
    });
    openSettings();
  } else app.dock.hide();

  fs.watch(app.getPath('home'), {}, (e, s) => {
    if (s === 'screenshot.png' && fs.existsSync(file)) handleFile();
  });

  let conf = settings.get('config');

  // Tray
  tray = new Tray(path.join(__dirname, 'assets/icons/icon.png'));
  tray.setToolTip('ScreenShotX');
  tray.setContextMenu(trayMenu(conf));
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // Shortcuts 
  registerShortcuts(conf);
});

// When window closes
app.on('window-all-closed', (event) => {
  event.preventDefault();
  app.dock.hide();
});

// Function to watch the file
function handleFile() {
  // Check if it exists
  let exist = fs.existsSync(file);
  if (!exist) { return customError('The handleFile function was called, but no file exists'); }
  // Check if we already did it
  const check = fs.statSync(file).size;
  if (check === lastFile) return;
  else lastFile = check;

  let conf = settings.get('config');

  if (conf.save === 'clipboard') saveClipboard();
  else if (conf.save === 'imgur') saveImgur();
  else if (conf.save === "local") saveLocal();
  else if (conf.save === 'custom') saveCustom();
  else if (conf.save === 'PyroCDN') savePyroCDN();
  else customError(`Save method ${conf.save} is not accepted.`);
}

process.on('uncaughtException', (err) => {
  throw err;
});
