
const fs = require('fs')

const { app, clipboard, nativeImage } = require('electron')
const settings = require('electron-settings')
const FormData = require('form-data')
const fetch = require('node-fetch')

const { notifUpload, customError, notifClip, notifSaved } = require('./notifications')
const createFileName = require('./createFileName')

function saveCustom () {
  const { customSettings } = settings.get('config')
  fs.readFile(file, (err, data) => {
    if (err) return customError(err.toString())
    const formData = new FormData()
    formData.append('file', data, createFileName(new Date()))
    const headers = Object.assign(customSettings.headers, formData.getHeaders())
    headers[customSettings.key] = customSettings.auth
    fetch(customSettings.url, {
      method: 'POST',
      headers: headers,
      body: formData
    }).then(async (res) => {
      const text = await res.text()
      const rurl = customSettings.rurl.toString()
      if (rurl === 'response') {
        clipboard.writeText(text)
        notifUpload()
      } else if (rurl.startsWith('json.')) {
        rurl.replace('json.', '')
        let json
        try {
          json = JSON.parse(text)
        } catch (err) {
          return customError(err.toString())
        }
        const url = rurl.split('.').reduce((T, A) => json[A] || '', null)
        if (!url) return customError(text)
        clipboard.writeText(url)
        notifUpload()
        try {
          if (fs.existsSync(file)) fs.unlinkSync(file)
        } catch (err) {
          return customError(err.toString())
        }
      } else {
        return customError('Response URL not acceptable')
      }
    }).catch(e => {
      return customError(e.toString())
    })
  })
}

function saveClipboard () {
  const image = nativeImage.createFromPath(file)
  try {
    fs.unlinkSync(file)
  } catch (err) {
    customError(err.toString())
  }
  clipboard.writeImage(image)
  notifClip()
}

function saveImgur () {
  fs.readFile(file, (err, data) => {
    if (err) return customError(err.toString())

    const formData = new FormData()
    formData.append('image', data, createFileName(new Date()))
    const headers = formData.getHeaders()
    headers.Authorization = 'Client-ID 6a5400948b3b376'
    fetch('https://api.imgur.com/3/upload', {
      method: 'POST',
      headers: headers,
      body: formData
    }).then(e => e.json())
      .then(json => {
        if (json.status === 200) {
          clipboard.writeText(json.data.link)
          notifUpload()
        } else {
          return customError('An unknown error has occured')
        }
      })
      .catch(e => {
        return customError(e.toString())
      })
  })
}

function saveLocal () {
  const filename = createFileName(new Date())
  const filePath = `${app.getPath('documents')}/screenshots/` + filename
  if (!fs.existsSync(`${app.getPath('documents')}/screenshots`)) {
    fs.mkdirSync(`${app.getPath('documents')}/screenshots`)
  }
  try {
    fs.renameSync(file, filePath)
  } catch (err) {
    customError(err.toString())
  }
  notifSaved()
}

function savePyroCDN () {
  // Get the configuration settings
  const conf = settings.get('config')
  // Read the file
  fs.readFile(file, (err, data) => {
    if (err) return customError(err.toString())
    const formData = new FormData()
    formData.append('file', data, createFileName(new Date()))
    const headers = formData.getHeaders()
    headers.key = conf.pyrocdn.key
    fetch(conf.pyrocdn.url, {
      method: 'POST',
      headers: headers,
      body: formData
    }).then(async (res) => {
      const text = await res.text()
      clipboard.writeText(text)
      notifUpload()
    }).catch(e => {
      return customError(e.toString())
    })
  })
}

module.exports = { saveCustom, saveClipboard, saveImgur, saveLocal, savePyroCDN }
