const { app, BrowserWindow, protocol, net } = require('electron/main')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
])

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  })

  win.loadURL('app://app/templates/index.html')
}

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const { host, pathname } = new URL(request.url)
    if (host !== 'app') {
      return new Response('Not found', { status: 404 })
    }

    const filePath = path.join(__dirname, decodeURIComponent(pathname.slice(1)))
    return net.fetch(pathToFileURL(filePath).toString())
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
