import { app, BrowserWindow, Menu, session } from 'electron'
import path from 'node:path'
import { watch } from 'node:fs'
import started from 'electron-squirrel-startup'
import { log } from './core'
import { bootstrap } from './bootstrap'

if (started) app.quit()

Menu.setApplicationMenu(null)

if (!app.isPackaged) {
  app.commandLine.appendSwitch('disable-http-cache')
}

log.catchErrors()

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 820,
    minHeight: 480,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged,
    },
  })

  const devServerUrl = process.env.NG_DEV_SERVER

  if (devServerUrl) {
    win.loadURL(devServerUrl)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(
      app.isPackaged
        ? path.join(process.resourcesPath, 'browser/index.html')
        : path.join(__dirname, '../../src/renderer/dist/renderer/browser/index.html')
    )
  }

  if (!app.isPackaged) {
    win.webContents.on('before-input-event', (event, input) => {
      const toggleDevTools =
        input.type === 'keyDown' &&
        (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i'))
      if (toggleDevTools) {
        win.webContents.toggleDevTools()
        event.preventDefault()
      }
    })
  }

  return win
}

function watchRendererSources(win: BrowserWindow): void {
  const dir = path.join(__dirname, '../../src/renderer/src')
  let timer: NodeJS.Timeout | null = null

  watch(dir, { recursive: true }, (_event, filename) => {
    if (!filename || !/\.(ts|html|css)$/.test(filename)) return

    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      if (!win.isDestroyed()) win.webContents.reloadIgnoringCache()
    }, 1500)
  })
}

app.whenReady().then(async () => {
  const csp = process.env.NG_DEV_SERVER
    ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*"
    : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'"

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    })
  })

  const prisma = await bootstrap()
  const win = createWindow()

  if (process.env.NG_DEV_SERVER) watchRendererSources(win)

  app.on('before-quit', async () => {
    await prisma.$disconnect()
  })
}).catch(async (err) => {
  log.error('Boot failed', err)
  await log.flush()
  app.exit(1)
})
