const { clipboard } = require('electron')
const settings = require('electron-settings')
const fetch = require('node-fetch')

const { notifUpload, customError, notifShorten } = require('./notifications')

function shortenURL (url) {
  // Get the shorten settings
  const { shorten } = settings.get('config')
  // Set the headers as the given headers and set content type
  const headers = shorten.headers
  headers['Content-Type'] = 'application/json'
  // POST to the given URL as body: { url: url }
  fetch(shorten.url, {
    method: 'POST',
    body: JSON.stringify({
      url: url
    }),
    headers: headers
  }).then(async res => {
    // Text is the response in text
    const text = await res.text()
    const rurl = shorten.rurl.toString()
    if (rurl === 'response') {
      // If the response is response, copy it and notify the user
      clipboard.writeText(text)
      return notifUpload()
    } else if (rurl.startsWith('json.')) {
      // If the responseURL starts with json., parse it
      rurl.replace('json.', '')
      let json
      try {
        // Attempt to parse the response
        json = JSON.parse(text)
      } catch (err) {
        // If it errors, notify the user the error
        return customError(err.toString())
      }
      // IDK this is pretty confusing ngl
      const url = rurl.split('.').reduce((T, A) => json[A] || '', null)
      if (!url) return customError(text)
      clipboard.writeText(url)
      return notifShorten()
    } else {
      // If it doesn't, notify the user.
      return customError('Response URL not acceptable')
    }
  })
}

module.exports = shortenURL
