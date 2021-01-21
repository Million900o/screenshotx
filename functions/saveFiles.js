
const fs = require('fs')

const { app, clipboard, nativeImage } = require('electron')
const settings = require('electron-settings')
const FormData = require('form-data')
const fetch = require('node-fetch')

const { notifUpload, customError, notifClip, notifSaved } = require('./notifications')
const createFileName = require('./createFileName')

function saveCustom () {
  // Get the configuration settings
  const { customSettings } = settings.get('config')
  // If there is no url, notify the user
  if (!customSettings.url) return customError('No custom URL was provided')
  fs.readFile(file, (err, data) => {
    // If it errors, notify the user
    if (err) return customError(err.toString())
    // Create FormData and add the file
    const formData = new FormData()
    formData.append('file', data, createFileName(new Date()))
    // Add the FormData headers AND the custom headers
    const headers = Object.assign(customSettings.headers, formData.getHeaders())
    // POST to the URL with the headers and FormData
    fetch(customSettings.url, {
      method: 'POST',
      headers: headers,
      body: formData
    }).then(async (res) => {
      // Parse the text and get response URL
      const text = await res.text()
      const rurl = customSettings.rurl.toString()
      if (rurl === 'response') {
        // Copy the text
        clipboard.writeText(text)
        // Notify the user
        notifUpload()
      } else if (rurl.startsWith('json.')) {
        rurl.replace('json.', '')
        let json
        try {
          // Parse the text
          json = JSON.parse(text)
        } catch (err) {
          // Notify the user if it errors
          return customError(err.toString())
        }
        // Turn x.y.z into ['x']['y']['z']
        const url = rurl.split('.').reduce((T, A) => json[A] || '', null)
        // Notify the user if there is no response
        if (!url) return customError(text)
        // Copy the URL and notify the user
        clipboard.writeText(url)
        notifUpload()
        try {
          // If the file exists, delete it
          if (fs.existsSync(file)) fs.unlinkSync(file)
        } catch (err) {
          // If there is an error, notify the user
          return customError(err.toString())
        }
      } else {
        // Notify the user that their settings are bad
        return customError('Response URL not acceptable')
      }
    }).catch(e => {
      // Notify the user that an error was thrown
      return customError(e.toString())
    })
  })
}

function saveClipboard () {
  // Get the image
  const image = nativeImage.createFromPath(file)
  try {
    // Delete the file
    fs.unlinkSync(file)
  } catch (err) {
    // Alert the user if there is an error
    customError(err.toString())
  }
  // Copy the image and notify the user
  clipboard.writeImage(image)
  notifClip()
}

function saveImgur () {
  fs.readFile(file, (err, data) => {
    if (err) return customError(err.toString())
    // Define FormData and add the image
    const formData = new FormData()
    formData.append('image', data, createFileName(new Date()))
    // Define headers and add Authentication
    const headers = formData.getHeaders()
    headers.Authorization = 'Client-ID 6a5400948b3b376'
    // POST to imgur api with the headers and FormData
    fetch('https://api.imgur.com/3/upload', {
      method: 'POST',
      headers: headers,
      body: formData
    }).then(e =>
      // Parse the response
      e.json())
      .then(json => {
        // Check the status of the response
        if (json.status === 200) {
          // If OK, copy the next and notify the user
          clipboard.writeText(json.data.link)
          notifUpload()
        } else {
          // If not, just return without any useful information
          return customError('An unknown error has occured')
        }
      })
      .catch(e => {
        // Notify the user if an error is thrown
        return customError(e.toString())
      })
  })
}

function saveLocal () {
  // Create a file name and path
  const filename = createFileName(new Date())
  const filePath = `${app.getPath('documents')}/screenshots/` + filename
  // Make the path if it doesn't exist
  if (!fs.existsSync(`${app.getPath('documents')}/screenshots`)) {
    fs.mkdirSync(`${app.getPath('documents')}/screenshots`)
  }
  try {
    // Rename the file
    fs.renameSync(file, filePath)
  } catch (err) {
    // If it errors, notify the user
    return customError(err.toString())
  }
  notifSaved()
}

function savePyroCDN () {
  // Get the configuration settings
  const conf = settings.get('config')
  // Read the file
  fs.readFile(file, (err, data) => {
    if (err) return customError(err.toString())
    // Create FormData and add the file to it
    const formData = new FormData()
    formData.append('file', data, createFileName(new Date()))
    // Get the FormData and add the key
    const headers = formData.getHeaders()
    headers.key = conf.pyrocdn.key
    // Post to the URL
    fetch(conf.pyrocdn.url, {
      method: 'POST',
      headers: headers,
      body: formData
    }).then(async (res) => {
      // Parse the text and copy it
      const text = await res.text()
      clipboard.writeText(text)
      // Nofity the user
      notifUpload()
    }).catch(e => {
      return customError(e.toString())
    })
  })
}

module.exports = { saveCustom, saveClipboard, saveImgur, saveLocal, savePyroCDN }
