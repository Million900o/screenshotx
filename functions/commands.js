const { app } = require('electron')
const { execSync } = require('child_process')

const activeWin = require('active-win')
const path = require('path')
const { customError } = require('./notifications')

// Get tmp file path
const tempImgPath = path.join(app.getPath('home') + '/screenshot.png')

// Create commands as variables
const fullscreenCMD = 'screencapture ' + tempImgPath
const selectionCMD = 'screencapture -i ' + tempImgPath
const windowCMD = 'screencapture -l$id ' + tempImgPath

function screenshotFullscreen () {
  // Run fullscreen command
  execSync(fullscreenCMD)
}

function screenshotSelection () {
  // Run selection command
  execSync(selectionCMD)
}

async function screenshotWindow () {
  // Get active window
  const active = await activeWin()
  // Return if no active window
  if (!active) return customError('No active window found')
  // Otherwise, run the command with the correct ID
  execSync(windowCMD.replace('$id', active.id), { async: true })
}

module.exports = { screenshotFullscreen, screenshotSelection, screenshotWindow }
