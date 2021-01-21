const { ipcRenderer } = require('electron')

let settings

function wait (a) { return new Promise(resolve => setTimeout(() => resolve(), a)) }

async function updateSettings (hideUpdated) {
  let customHeaders = document.querySelector('#custom_headers').value
  if (document.getElementById('save-to').value === 'custom') {
    try {
      customHeaders = JSON.parse(document.querySelector('#custom_headers').value || '{}')
    } catch (err) {
      document.getElementById('updated').innerHTML = '<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Custom Uploader Headers input is not an object.</div>'
      return
    }
  }

  let shortenHeaders
  try {
    shortenHeaders = JSON.parse(document.querySelector('#shorten_headers').value || '{}')
  } catch (err) {
    document.getElementById('updated').innerHTML = '<div class="alert alert-danger alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>URL Shortener Headers input is not an object.</div>'
    return
  }

  const config = {
    c_fs: document.getElementById('c_fs').value,
    c_s: document.getElementById('c_s').value,
    c_w: document.getElementById('c_w').value,
    o_se: document.getElementById('o_se').value,
    s_u: document.getElementById('s_u').value,
    save: document.getElementById('save-to').value,
    shorten: {
      url: document.querySelector('#shorten_url').value,
      headers: shortenHeaders,
      rurl: document.querySelector('#shorten_rurl').value
    },
    customSettings: {
      url: document.querySelector('#custom_url').value,
      headers: customHeaders,
      rurl: document.querySelector('#custom_rurl').value
    },
    pyrocdn: {
      key: document.querySelector('#pyrocdn_auth').value,
      url: document.querySelector('#pyrocdn_url').value
    }
  }

  settings = config

  ipcRenderer.send('settings:update', config)

  if (hideUpdated !== true) {
    document.getElementById('updated').innerHTML = '<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Updated</div>'
    await wait(2600)
    document.getElementById('updated').innerHTML = ''
  }
};

document.getElementById('update-btn').onclick = updateSettings

document.getElementById('save-to').onchange = () => {
  showPage(document.getElementById('save-to').value)
  updateSettings(true)
}

ipcRenderer.on('log', (e, ...args) => console.log(...args))

ipcRenderer.on('settings:start', (e, item) => {
  settings = item
  document.getElementById('container').style.visibility = 'visible'
  document.getElementById('c_fs').value = item.c_fs
  document.getElementById('c_s').value = item.c_s
  document.getElementById('c_w').value = item.c_w
  document.getElementById('s_u').value = item.s_u
  document.getElementById('o_se').value = item.o_se
  $('option[value=' + item.save + ']')
    .attr('selected', true)
  const val = document.getElementById('save-to').value

  const cs = item.customSettings || {}
  const us = item.shorten || {}
  const pyro = item.pyrocdn || {}

  document.getElementById('custom_url').value = cs.url || ''
  document.getElementById('custom_headers').value = JSON.stringify(cs.headers || {}).toString()
  document.getElementById('custom_rurl').value = cs.rurl || ''

  document.getElementById('pyrocdn_auth').value = pyro.key || ''
  document.getElementById('pyrocdn_url').value = pyro.url || ''

  document.getElementById('shorten_url').value = us.url || ''
  document.getElementById('shorten_headers').value = JSON.stringify(us.headers || {}).toString()
  document.getElementById('shorten_rurl').value = us.rurl || ''

  showPage(val)
})

function showPage (val) {
  if (val === 'custom') {
    document.getElementById('customSettings').style.visibility = 'visible'
    document.getElementById('customSettings').style.display = 'block'
    document.getElementById('pyrocdn_settings').style.display = 'none'
  } else document.getElementById('customSettings').style.display = 'none'
  if (val === 'PyroCDN') {
    document.getElementById('pyrocdn_settings').style.visibility = 'visible'
    document.getElementById('pyrocdn_settings').style.display = 'block'
  } else document.getElementById('pyrocdn_settings').style.display = 'none'
}
