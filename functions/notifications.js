const { Notification } = require('electron')

// Create the notification functions
const notifClip = () => new Notification({ title: 'Screenshot Taken', body: 'Screenshot has been copied to your clipboard' }).show()
const notifUpload = () => new Notification({ title: 'Screenshot Uploaded', body: 'Screenshot link has been copied to your clipboard' }).show()
const notifSaved = () => new Notification({ title: 'Screenshot Uploaded', body: 'Screenshot has been saved to file' }).show()
const notifShorten = () => new Notification({ title: 'URL Shortened', body: 'Short URL has been copied to your clipboard' }).show()
const customError = (t) => new Notification({ title: 'Error', body: t }).show()

module.exports = { notifClip, notifUpload, notifSaved, customError, notifShorten }
