import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}
const ipc = {
  render: {
    // 主进程发出的通知
    send: ['checkForUpdate', 'checkAppVersion'],
    // 渲染进程发出的通知
    receive: ['message']
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', {
      openFile: () => ipcRenderer.invoke('dialog:openFile'),
      saveFile: (...args) => ipcRenderer.invoke('dialog:saveFile', ...args),

      setConfiguration: (value) => ipcRenderer.invoke('set-configuration', value),
      getConfiguration: (callback) =>
        ipcRenderer.on('get-configuration', (_event, value) => callback(value)),

      getFileData: (data, callback) => {
        const channel = new MessageChannel()
        const port1 = channel.port1
        const port2 = channel.port2

        port2.postMessage(data)
        port2.onmessage = (event) => {
          callback(event.data)
        }

        ipcRenderer.postMessage('give-me-a-stream', null, [port1])
      },

      service: (...args) => ipcRenderer.send('detach:service', ...args),

      ipcRender: {
        // 主进程发送通知给渲染进程
        send: (channel, data) => {
          const validChannels = ipc.render.send
          if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data)
          }
        },
        // 渲染进程监听到主进程发来的通知，执行相关的操作
        receive: (channel, func) => {
          const validChannels = ipc.render.receive
          if (validChannels.includes(channel)) {
            ipcRenderer.on(`${channel}`, (_event, ...args) => func(...args))
          }
        }
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.ipc = ipc
}
