const { ipcRenderer } = require('electron');

document.getElementById('container').style.visibility = "visible";
// document.getElementById('open-con').style.visibility = "visible";

ipcRenderer.on('shorten:start', (e, url) => {
  document.getElementById('url').value = url;
});

document.getElementById('form').onsubmit = submitForm;

function submitForm(e) {
  e ? e.preventDefault() : undefined;
  ipcRenderer.send('shorten:shorten', document.getElementById('url').value);
};