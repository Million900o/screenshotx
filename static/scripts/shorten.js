const { ipcRenderer } = require('electron')

document.getElementById('container').style.visibility = 'visible'

ipcRenderer.on('shorten:start', (e, url) => {
  document.getElementById('url').value = url
})

document.getElementById('form').onsubmit = submitForm

function submitForm (e) {
  if (e) { e.preventDefault() }
  ipcRenderer.send('shorten:shorten', document.getElementById('url').value)
};
