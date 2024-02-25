/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, shell, BrowserWindow, ipcMain, nativeTheme, Menu, dialog } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import path from 'path'
import lodash from 'lodash'
import axios from 'axios'
import compressing from 'compressing'
import { autoUpdater } from 'electron-updater'

import createTray from './tray'

// import installExtension, { VUEJS_DEVTOOLS, VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import configFilePath from '../../resources/config.json?commonjs-external&asset'
import createWorker from './worker?nodeWorker'
import icon from '../../resources/icon.png?asset'
import {
  handleXlsxSave,
  handleSelectFile,
  copyFolderRecursiveSync,
  cersionComparison
} from './utils'

const myWorker = createWorker({ workerData: 'worker' })
let mainWindow
let defaultConfig

// 发送消息给渲染进程
const sendUpdateMessage = (...args) => mainWindow.webContents.send('message', ...args)

function createWindow() {
  const readResult = fs.readFileSync(configFilePath, 'utf8')
  defaultConfig = JSON.parse(readResult)

  // 创建浏览器窗口。
  mainWindow = new BrowserWindow({
    ...defaultConfig.browserWindow,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      devToolsExtensions: true, // 允许加载 Chrome 扩展
      nodeIntegration: false, // 启用 Node.js 集成
      nodeIntegrationInWorker: true
    }
  })

  nativeTheme.themeSource = defaultConfig.nativeTheme.themeSource

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 基于 electron-vite cli 的渲染器热模块替换（HMR）。
  // 在开发中加载远程URL，生产中加载本地HTML文件。
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'right' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  createTray(mainWindow)

  console.log('Hello from Electron 👋👋👋')
}

// 当Electron完成初始化并准备创建浏览器窗口时，将调用此方法。某些API只能在此事件发生后使用。
app.whenReady().then(() => {
  // installExtension('nhdogjmejiglipccpnnnanhbledajbpd')
  //   .then((name) => console.log(`Added Extension:  ${name}`))
  //   .catch((err) => console.log('An error occurred: ', err))

  // 为Windows设置应用用户模型ID
  electronApp.setAppUserModelId('com.electron')

  createWindow()

  mainWindow.on('ready-to-show', () => {
    mainWindow.webContents.send('get-configuration', {
      ...defaultConfig,
      app: {
        version: app.getVersion()
      }
    })
  })
})

// 在开发中通过按下F12默认打开或关闭开发者工具，而在生产环境中忽略CommandOrControl + R的快捷键。
// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
app.on('browser-window-created', (_, window) => {
  optimizer.watchWindowShortcuts(window)
})
app.on('activate', function () {
  // 在macOS上，当点击dock图标且没有其他窗口打开时，重新创建应用程序中的窗口是一种常见做法。
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// 在窗口关闭时终止 Python 服务
app.on('before-quit', () => {})

// 在所有窗关闭时退出应用，除了macOS系统。在macOS上，应用和菜单栏通常会保持活跃状态，直到用户使用Cmd + Q 明确退出应用。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 在这个文件中，你可以包括应用程序特定的主进程代码的其余部分。你也可以把它们放在单独的文件中，并在此处引用它们。

ipcMain.handle('dialog:openFile', handleSelectFile)
ipcMain.handle('dialog:saveFile', (_event, data) => handleXlsxSave(data))
ipcMain.handle('set-configuration', (_event, data) => {
  defaultConfig = lodash.merge(defaultConfig, data)

  nativeTheme.themeSource = defaultConfig.nativeTheme.themeSource

  defaultConfig = lodash.merge(defaultConfig, {
    nativeTheme: {
      themeSource: nativeTheme.themeSource,
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors
    }
  })
  if (data) {
    fs.writeFile(configFilePath, JSON.stringify(defaultConfig), (e) => {
      console.log('fs.writeFile', e)
    })
  }

  mainWindow.webContents.send('get-configuration', defaultConfig)

  return defaultConfig
})
ipcMain.on('give-me-a-stream', (event) => {
  // 当我们在主进程中接收到 MessagePort 对象, 它就成为了 MessagePortMain.
  const port = event.ports[0]
  // MessagePortMain 使用了 Node.js 风格的事件 API, 而不是
  // web 风格的事件 API. 因此使用 .on('message', ...) 而不是 .onmessage = ...
  port.on('message', (event) => {
    const { data } = event
    myWorker.postMessage(data)
    myWorker.on('message', (message) => {
      port.postMessage(message)
      port.close()
    })
  })

  // MessagePortMain 阻塞消息直到 .start() 方法被调用
  port.start()
})
ipcMain.on('detach:service', async (_event, { type }) => {
  const operation = {
    minimize: () => {
      mainWindow.focus()
      mainWindow.minimize()
    },
    maximize: () => {
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
    },
    close: () => {
      mainWindow.close()
    }
  }
  operation[type]()
})
ipcMain.on('show-context-menu', (event) => {
  const template = [
    {
      label: 'Menu Item 1',
      click: () => {
        event.sender.send('context-menu-command', 'menu-item-1')
      }
    },
    { type: 'separator' },
    { label: 'Menu Item 2', type: 'checkbox', checked: true }
  ] as any
  const menu = Menu.buildFromTemplate(template)
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) as BrowserWindow | undefined })
})
// 我们需要主动触发一次更新检查，当我们收到渲染进程传来的消息，主进程就就进行一次更新检查
ipcMain.on('checkForUpdate', () => autoUpdater.checkForUpdates())
// 当前引用的版本告知给渲染层
ipcMain.on('checkAppVersion', () => sendUpdateMessage('version', app.getVersion()))

// 主进程跟渲染进程通信
const message = {
  version: '当前版本信息',
  error: '检查更新出错!',
  checking: '正在检查更新...',
  updateAva: '检测到新版本...',
  updateNotAva: '现在使用的就是最新版本，不用更新!',
  updateDownloadedSuccess: '更新资源，下载成功!',
  updateDownloadedProgress: '更新资源，下载中...',
  updating: '更新中...',
  updateCompleted: '更新成功'
}

// 设置自动下载为false，也就是说不开始自动下载
autoUpdater.autoDownload = false
// 检测下载错误
autoUpdater.on('error', (error) => sendUpdateMessage('error', `${message.error}:${error}`))
// 检测是否需要更新
autoUpdater.on('checking-for-update', () => sendUpdateMessage('checking'))
// 检测到不需要更新时,这里可以做静默处理，不给渲染进程发通知，或者通知渲染进程当前已是最新版本，不需要更新
autoUpdater.on('update-not-available', () => sendUpdateMessage('updateNotAva'))
// 更新下载进度,直接把当前的下载进度发送给渲染进程即可，有渲染层自己选择如何做展示
autoUpdater.on('download-progress', (progress) =>
  sendUpdateMessage('updateDownloadedProgress', progress)
)
// 检测到可以更新时
autoUpdater.on('update-available', (info) => {
  const appPath = app.getAppPath()
  // 读取版本号
  const manifestJSon = fs.readFileSync(path.join(appPath, '\\package.json'), 'utf-8')
  const mainTextObj = JSON.parse(manifestJSon)
  // 版本号
  sendUpdateMessage({ sss: '?????', a: mainTextObj.version, b: info.version })

  if (mainTextObj.version == info.version) {
    sendUpdateMessage('updateNotAva')
    return
  }

  // 获取 版本号、发布日志
  sendUpdateMessage('updateAva', info)
  // 这里我们可以做一个提示，让用户自己选择是否进行更新
  dialog
    .showMessageBox({
      type: 'info',
      title: '应用有新的更新',
      message: `发现新版本${info.version}，是否现在更新？`,
      buttons: ['是', '否']
    })
    .then(({ response }) => {
      if (response === 0) {
        sendUpdateMessage({ a: app.getVersion(), b: info.version })
        if (cersionComparison(app.getVersion(), info.version) == 'resource') {
          downloadAndUnzip(info)
        } else {
          // 下载更新
          autoUpdater.downloadUpdate()
          sendUpdateMessage('updateDownloadedSuccess')
        }
      }
    })

  // 也可以默认直接更新，二选一即可
  // autoUpdater.downloadUpdate();
  // sendUpdateMessage(message.updateAva);
})

// 当需要更新的内容下载完成后
autoUpdater.on('update-downloaded', () => {
  sendUpdateMessage('updateDownloadedSuccess')
  // 给用户一个提示，然后重启应用；或者直接重启也可以，只是这样会显得很突兀
  dialog
    .showMessageBox({
      title: '安装更新',
      message: '更新下载完毕，应用将重启并进行安装',
      type: 'info',
      buttons: ['稍后提示', '立即更新']
    })
    .then(({ response }) => {
      if (response === 1) {
        autoUpdater.quitAndInstall()
      }
    })
})

async function downloadAndUnzip(info = { version: '1.0.10' }) {
  // const appPath = 'C:\\Users\\Administrator\\AppData\\Local\\Programs\\electron-app'
  const appPath = app.getAppPath()

  // 使用 jsdelivr 加速
  const downloadZipPath = `https://cdn.jsdelivr.net/gh/100110001/electron@${info.version}/app.zip`
  const downloadPath = path.join(appPath, `..\\..\\resources\\app-${info.version}.zip`)
  const unzipPath = path.join(appPath, `..\\..\\resources\\app-${info.version}`)

  sendUpdateMessage({ updating: 'updating', downloadZipPath, downloadPath, unzipPath })
  axios({
    url: downloadZipPath,
    method: 'GET',
    responseType: 'stream',
    timeout: 100000,
    onDownloadProgress: (progressEvent) => {
      // console.log('下载进度：', Math.round(progressEvent.progress * 100) + '%')
      sendUpdateMessage('updateDownloadedProgress', {
        ...progressEvent,
        percent: (progressEvent.progress as number) * 100
      })
    }
  })
    .then((response) => {
      const file = fs.createWriteStream(downloadPath)
      response.data.pipe(file)
      file.on('finish', () => {
        sendUpdateMessage('updating')
        file.close(() => {
          compressing.zip
            .uncompress(downloadPath, unzipPath)
            .then(() => {
              const unzipFolder = path.join(appPath, '..\\..\\resources', `app-${info.version}`)
              const targetFolder = path.join(appPath, '..\\..\\resources', 'app')
              copyFolderRecursiveSync(unzipFolder, targetFolder)

              sendUpdateMessage('updateDownloadedSuccess')
              setTimeout(() => {
                mainWindow.reload()
              }, 3000)
            })
            .catch((error) => {
              console.error('下载过程中出现错误：', error)
              sendUpdateMessage('error', error)
            })
        })
      })
    })
    .catch((error) => {
      console.error('下载过程中出现错误：', error)
      sendUpdateMessage('error', error)
    })
}
