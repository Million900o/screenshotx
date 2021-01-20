
const fs = require('fs');

const { clipboard, nativeImage } = require('electron');
const settings = require('electron-settings');
const FormData = require('form-data');
const fetch = require('node-fetch');

const { notif_upload, customError, notif_clip } = require('./notifications');
const createFileName = require('./createFileName');

function saveCustom() {
  let { custom_settings } = settings.get('config');
  fs.readFile(file, (err, data) => {
    if (err) return customError(err.toString());
    const formData = new FormData();
    formData.append('file', data, createFileName(new Date()));
    let headers = Object.assign(custom_settings['headers'], formData.getHeaders());
    headers[custom_settings.key] = custom_settings.auth;
    fetch(custom_settings.url, {
      method: 'POST',
      headers: headers,
      body: formData
    }).then(async (res) => {
      const text = await res.text();
      const rurl = custom_settings.rurl.toString();
      if (rurl === 'response') {
        clipboard.writeText(text);
        notif_upload();
      } else if (rurl.startsWith('json.')) {
        rurl.replace('json.', '');
        let json;
        try {
          json = JSON.parse(text);
        } catch (err) {
          return customError(err.toString());
        }
        const args = rurl.split('.');
        const url = args.reduce((T, A) => (T = json[A] || '', T), null);
        if (!url) return customError(text);
        clipboard.writeText(url);
        notif_upload();
        try {
          fs.unlinkSync(file);
        } catch (err) {
          return customError(err.toString());
        }
        return;
      } else {
        return customError('Response URL not acceptable');
      }
    }).catch(e => {
      return customError(e.toString());
    });
  });
}

function saveClipboard() {
  let image = nativeImage.createFromPath(file);
  try {
    fs.unlinkSync(file);
  } catch (err) {
    customError(err.toString());
  }
  clipboard.writeImage(image);
  notif_clip();
}

function saveImgur() {
  fs.readFile(file, (err, data) => {
    if (err) return customError(err.toString());

    const formData = new FormData();
    formData.append('image', data, createFileName(new Date()));
    const headers = formData.getHeaders();
    headers['Authorization'] = 'Client-ID 6a5400948b3b376';
    fetch('https://api.imgur.com/3/upload', {
      method: 'POST',
      headers: headers,
      body: formData,
    }).then(e => e.json())
      .then(json => {
        if (json.status === 200) {
          clipboard.writeText(json.data.link);
          notif_upload();
        } else {
          return customError('An unknown error has occured');
        }
      })
      .catch(e => {
        return customError(e.toString());
      });
  });
}

function saveLocal() {
  const filename = createFileName(new Date());
  let file_path = `${app.getPath('documents')}/screenshots/` + filename;
  if (!fs.existsSync(`${app.getPath('documents')}/screenshots`)) {
    fs.mkdirSync(`${app.getPath('documents')}/screenshots`);
  }
  try {
    fs.renameSync(file, file_path);
  } catch (err) {
    customError(err.toString());
  }
  notif_saved();
}

function savePyroCDN() {
  let conf = settings.get('config');
  fs.readFile(file, (err, data) => {
    if (err) return customError(err.toString());

    const formData = new FormData();
    formData.append('file', data, createFileName(new Date()));
    let headers = formData.getHeaders();
    headers['key'] = conf.pyrocdn.key;
    fetch(conf['pyrocdn']['url'], {
      method: 'POST',
      headers: headers,
      body: formData
    }).then(async (res) => {
      const text = await res.text();
      clipboard.writeText(text);
      notif_upload();
    }).catch(e => {
      return customError(e.toString());
    });
  });
}

module.exports = { saveCustom, saveClipboard, saveImgur, saveLocal, savePyroCDN };
