import { app, BrowserWindow, session } from 'electron'
import path from 'node:path'
import started from 'electron-squirrel-startup'
import { log } from './core'
import { bootstrap } from './bootstrap'

if (started) app.quit()

log.catchErrors()

function createWindow(): void {
  const win = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.loadFile(
    path.join(__dirname, '../../src/renderer/dist/renderer/browser/index.html')
  )
}

app.whenReady().then(async () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'",
        ],
      },
    })
  })

  const prisma = await bootstrap()
  createWindow()

  app.on('before-quit', async () => {
    await prisma.$disconnect()
  })
})
