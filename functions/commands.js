const { app } = require('electron');
const { execSync } = require('child_process');

const activeWin = require('active-win');
const path = require('path');

// Get tmp file path
let temp_img_path = path.join(app.getPath('home') + '/screenshot.png');

// Create commands as variables
let fullscreen_cmd = 'screencapture ' + temp_img_path;
let selection_cmd = 'screencapture -i ' + temp_img_path;
let window_cmd = 'screencapture -l$id ' + temp_img_path;

function screenshotFullscreen() {
  // Run fullscreen command
  execSync(fullscreen_cmd);
}

function screenshotSelection() {
  // Run selection command
  execSync(selection_cmd);
}

async function screenshotWindow() {
  // Get active window
  let active = await activeWin();
  // Return if no active window
  if (!active) return customError('No active window found');
  // Otherwise, run the command with the correct ID
  execSync(window_cmd.replace('$id', active.id), { async: true });
}

module.exports = { screenshotFullscreen, screenshotSelection, screenshotWindow };
