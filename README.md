# electron-app

使用 Vue 和 TypeScript 的 Electron 应用程序

[Electron]: https://www.electronjs.org/zh/
[Vue]: https://cn.vuejs.org/guide/introduction.html
[Vite]: https://cn.vitejs.dev/guide/
[Electron-vite]: https://cn.electron-vite.org/guide/



## 推荐的 IDE 设置

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## 项目设置

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```





# 关于开发

## 使用 VS Code 调试

[使用 VS Code 调试]: https://www.electronjs.org/zh/docs/latest/tutorial/tutorial-first-app#%E5%8F%AF%E9%80%89%E4%BD%BF%E7%94%A8-vs-code-%E8%B0%83%E8%AF%95



## 预加载脚本

[使用预加载脚本]: https://cn.electron-vite.org/guide/dev#%E4%BD%BF%E7%94%A8%E9%A2%84%E5%8A%A0%E8%BD%BD%E8%84%9A%E6%9C%AC
[使用预加载脚本]: https://www.electronjs.org/zh/docs/latest/tutorial/tutorial-preload



### 什么是预加载脚本？

Electron 的主进程是一个拥有着完全操作系统访问权限的 Node.js 环境。 除了 [Electron 模组](https://www.electronjs.org/zh/docs/latest/api/app) 之外，您也可以访问 [Node.js 内置模块](https://nodejs.org/dist/latest/docs/api/) 和所有通过 npm 安装的包。 另一方面，出于安全原因，渲染进程默认跑在网页页面上，而并非 Node.js里。

为了将 Electron 的不同类型的进程桥接在一起，我们需要使用被称为 **预加载** 的特殊脚本。

![eproc](https://cn.electron-vite.org/electron-processes.png)



```js
// preload.js
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
  // 除函数之外，我们也可以暴露变量
})
```

> IPC 安全
>
> 可以注意到我们使用了一个辅助函数来包裹 `ipcRenderer.invoke('ping')` 调用，而并非直接通过 context bridge 暴露 `ipcRenderer` 模块。 你**永远**都不会想要通过预加载直接暴露整个 `ipcRenderer` 模块。 这将使得你的渲染器能够直接向主进程发送任意的 IPC 信息，会使得其成为恶意代码最强有力的攻击媒介。

### 沙盒的限制

从 Electron 20 开始，预加载脚本默认沙盒化，不再拥有完整 Node.js 环境的访问权。实际上，这意味着你只拥有一个 polyfilled 的 require 函数（类似于 Node 的 require 模块），它只能访问一组有限的 API。

| 可用的 API            | 详细信息                                                     |
| :-------------------- | :----------------------------------------------------------- |
| Electron 模块         | 仅 [渲染进程模块](https://www.electronjs.org/zh/docs/latest/api/context-bridge) |
| Node.js 模块          | `events`, `timers`, `url`                                    |
| Polyfilled 的全局模块 | `Buffer`, `process`, `clearImmediate`, `setImmediate`        |

提示

因为 `require` 函数是一个功能有限的 polyfill，你无法把 preload 脚本拆成多个文件并作为 CommonJS 模块来加载，除非指定了 `sandbox: false`。





## Main Process 模块

### BrowserWindow

- `title`string(可选) - 默认窗口标题 默认为`"Electron"`。 如果由`loadURL()`加载的HTML文件中含有标签`<title>`，此属性将被忽略。
- `resizable` boolean (可选) - 窗口大小是否可调整。 默认值为 `true`。

- `show` boolean (可选) - 窗口是否在创建时显示。 默认值为 `true`。

- `frame` boolean (可选) - 设置为 `false` 时可以创建一个[无边框窗口](https://www.electronjs.org/zh/docs/latest/tutorial/window-customization#create-frameless-windows) 默认值为 `true`。
- `hasShadow` boolean (可选) - 窗口是否有阴影. 默认值为 `true`。
- `transparent` boolean (可选) - 使窗口 [透明](https://www.electronjs.org/zh/docs/latest/tutorial/window-customization#create-transparent-windows)。 默认值为 `false`. 在Windows上，仅在无边框窗口下起作用。

- `autoHideMenuBar` boolean (可选) - 自动隐藏菜单栏，除非按了`Alt`键。 默认值为 `false`
- `titleBarStyle` string (可选) _macOS_ _Windows_ - 窗口标题栏样式。 默认值为 `default`. 可能的值有
  - `default` - 分别返回 macOS 或者 Windows 的标准标题栏
  - `hidden` - 在一个隐藏的标题栏和一个全尺寸大小的内容窗口中取得结果。 在 macOS 内, 窗口将一直拥有位于左上的标准窗口控制器 (“traffic lights”)。 在 Windows上，当与 `titleBarOverlay: true` 合并时，它将激活窗口控件叠加(详情请参阅 `titleBarOverlay`)，否则将不会显示窗口控件。
  - `hiddenInset` _macOS_ - 仅 macOS，隐藏标题栏，使用窗口边缘稍微小的红绿灯按钮替代。
  - `customButtonsOnHover` _macOS_ - 仅 macOS，隐藏的标题栏的全尺寸的内容窗口， 红绿灯按钮在鼠标悬停在窗口左上方时显示。 **注意:** 此选项目前是实验性的
- `titleBarOverlay` Object | Boolean (optional) - When using a frameless window in conjunction with `win.setWindowButtonVisibility(true)` on macOS or using a `titleBarStyle` so that the standard window controls ("traffic lights" on macOS) are visible, this property enables the Window Controls Overlay [JavaScript APIs](https://github.com/WICG/window-controls-overlay/blob/main/explainer.md#javascript-apis) and [CSS Environment Variables](https://github.com/WICG/window-controls-overlay/blob/main/explainer.md#css-environment-variables). 指定 `true` 将导致覆盖默认系统颜色。 默认值为 `false`
  - `color` String (可选) _Windows_ - 启用窗口控制时覆盖面的 CSS 颜色 默认是系统颜色。
  - `symbolColor` String (可选) _Windows_ - 启用时窗口控制中符号的 CSS 颜色 默认是系统颜色。
  - `height` Integer (可选) _macOS_ _Windows_ - 标题栏和 Window Controls Overlay，以像素为单位。 默认值为系统高度。

## [Channel Messaging API](https://developer.mozilla.org/zh-CN/docs/Web/API/Channel_Messaging_API)

**Channel Messaging API** 允许两个不同的脚本运行在同一个文档的不同浏览器上下文（比如两个 iframe，或者文档主体和一个 iframe，使用 [`SharedWorker`](https://developer.mozilla.org/zh-CN/docs/Web/API/SharedWorker) 的两个文档，或者两个 worker）来直接通讯，在每端使用一个端口（port）通过双向频道（channel）向彼此传递消息。

> **备注：** 此特性在 [Web Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API) 中可用

使用 [`MessageChannel()`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel/MessageChannel) 构造函数来创建通讯信道。一旦创建，信道的两个端口即可通过 [`MessageChannel.port1`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel/port1) 和 [`MessageChannel.port2`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel/port2) 属性进行访问（都会返回 [`MessagePort`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort) 对象）。创建信道的应用程序使用 `port1`，在另一端的程序使用 `port2`——你向 `port2` 发送信息，然后携带 2 个参数（需要传递的消息，要传递所有权的对象，在这里是 port 自身）调用 [`window.postMessage`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage) 方法将端口信息传递到另一个浏览器上下文。当这些可传递的对象被传递后，他们就从之前所属的上下文中消失了。比如一个 port，一旦被发送，在原本的上下文中就再也不可用了。注意当前仅有 [`ArrayBuffer`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) 和 [`MessagePort`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort) 对象可以被发送。

另一个浏览器上下文可以使用 [`MessagePort.onmessage`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort/message_event) 监听信息，并使用事件的 `data` 属性获取消息内容。你可以通过 [`MessagePort.postMessage` (en-US)](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/postMessage) 向原来的文档发送应答消息。

当你想要停止通过信道发送消息时，你可以调用来关闭 [`MessagePort.close` (en-US)](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/close) 端口。

- [`MessageChannel`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel) 创建一个新的发送消息的信道。
- [`MessagePort`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort) 控制消息信道的端口，允许从一个端口发送消息，并监听另一端消息的到来。

  - [`MessagePort.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/postMessage) 从端口发送一条消息，并且可选是否将对象的所有权交给其他浏览器上下文。
  - [`MessagePort.start`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/start) 开始发送该端口中的消息队列 (只有使用 [`EventTarget.addEventListener`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener) 的时候才需要调用；当使用 [`MessagePort.onmessage`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort/message_event) 时，是默认开始的。)
  - [`MessagePort.close`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/close) 断开端口连接，它将不再是激活状态。
  - [`MessagePort.onmessage`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessagePort/message_event) 是一个 [`EventListener`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener), 当类型为 `message` 的 [`MessageEvent`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageEvent) 在该端口触发时，它将会被调用 ── 也就是说，该端口收到了一条消息。
  - [`onmessageerror` (en-US)](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/messageerror_event) 是一个 [`EventListener`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener), 当类型为 `MessageError` 的 [`MessageEvent`](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageEvent) 被触发时，它将会被调用 ── 这意味着，端口收到了一条无法被反序列化的消息。

- [channel messaging 基本演示](https://github.com/mdn/dom-examples/tree/main/channel-messaging-basic)

- [多个消息演示](https://github.com/mdn/dom-examples/tree/main/channel-messaging-multimessage)

- [Using channel messaging](https://developer.mozilla.org/zh-CN/docs/Web/API/Channel_Messaging_API/Using_channel_messaging)





## 菜单和托盘

### 应用内菜单

[官方文档]: https://www.electronjs.org/zh/docs/latest/api/menu



```javascript
const { app, Menu } = require('electron')

const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [
                { role: 'startSpeaking' },
                { role: 'stopSpeaking' }
              ]
            }
          ]
        : [
            { role: 'delete' },
            { type: 'separator' },
            { role: 'selectAll' }
          ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ]
        : [
            { role: 'close' }
          ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
```



### 上下文菜单



[官方文档]: https://www.electronjs.org/zh/docs/latest/api/menu#%E6%B8%B2%E6%9F%93%E8%BF%9B%E7%A8%8B


要创建由渲染器启动的菜单，请通过 IPC 发送所需的信息到主过程，并让主过程代替渲染器显示菜单

```javascript
*// renderer*
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  ipcRenderer.send('show-context-menu')
})

ipcRenderer.on('context-menu-command', (e, command) => {
  console.log(e, command)
})

*// main*
ipcMain.on('show-context-menu', (event) => {
  const template = [
    {
      label: 'Menu Item 1',
      click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
    },
    { type: 'separator' },
    { label: 'Menu Item 2', type: 'checkbox', checked: true }
  ]
  const menu = Menu.buildFromTemplate(template)
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
})
```





### 托盘



[官方文档]: https://www.electronjs.org/zh/docs/latest/tutorial/tray

```javascript
import { Tray, Menu, BrowserWindow } from 'electron'
import favicon from '../../resources/favicon.ico?asset'

export default function createTray(win: BrowserWindow) {
  const tray = new Tray(favicon)

  const isMac = process.platform === 'darwin'

  const contextMenu = Menu.buildFromTemplate([
    { label: 'electron', enabled: false },
    { label: '退出', role: isMac ? 'close' : 'quit' }
  ])
  // 工具提示和标题
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    win.show()
  })
}
```





## 无边框窗口

[官方文档]: https://www.electronjs.org/zh/docs/latest/tutorial/window-customization#%E5%88%9B%E5%BB%BA%E6%97%A0%E8%BE%B9%E6%A1%86%E7%AA%97%E5%8F%A3

要创建无边框窗口，需在 `BrowserWindow` 的构造中将 `frame` 参数设置为 `false`：

```js
// main
const { BrowserWindow } = require('electron')
const win = new BrowserWindow({ frame: false })
```



### 应用自定义标题栏样式

```js
const { BrowserWindow } = require('electron')
const win = new BrowserWindow({
  titleBarStyle: 'hidden',
  titleBarOverlay: {
    color: '#2a2a2b', // 背景色
    symbolColor: '#fff', // 按钮图标颜色
    height: 24
  }
})
win.show()
```

**无边框窗口仅能实现通用的样式，而且样式也比较奇怪：控制区域图标大小、间距无法修改，也没法内置其他的操作图标进去**

默认情况下, 无边框窗口是不可拖拽的。 应用程序需要在 CSS 中指定 `-webkit-app-region: drag` 来告诉 Electron 哪些区域是可拖拽的（如操作系统的标准标题栏），在可拖拽区域内部使用 `-webkit-app-region: no-drag` 则可以将其中部分区域排除。 请注意, 当前只支持矩形形状。

注意: `-webkit-app-region: drag `在开发人员工具打开时会出现问题。 查看更多信息 (包括变通方法), 请参见此 [GitHub 问题 ](https://github.com/electron/electron/issues/3647)。

要使整个窗口可拖拽, 您可以添加 `-webkit-app-region: drag` 作为 `body` 的样式:

```html
<body style="-webkit-app-region: drag"></body>
```

请注意，如果您使整个窗口都可拖拽，则必须将其中的按钮标记为不可拖拽，否则用户将无法点击它们：

```css
button {
  -webkit-app-region: no-drag;
}
```

如果只将自定义标题栏设置为可拖拽，还需要使标题栏中的所有按钮都不可拖拽。

### 自定义窗口标题栏

```js
// main
    new BrowserWindow({
      autoHideMenuBar: true,
      frame: true, // 无边框窗口
      titleBarStyle: 'hidden',// 无标题
      show: false,
    });

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
```

```html
// renderer
<a-layout-header class="layout-header">
  <div class="dragarea"></div>
  <div class="action_button" @click="action('minimize')"><icon-minus /></div>
  <div class="action_button" @click="action('maximize')"><icon-expand /></div>
  <div class="action_button action_button_close" @click="action('close')">
    <icon-close />
  </div>
</a-layout-header>

// js
const action = (type) => ipcRenderer.send('detach:service', ...args)
```



### 提示：禁用文本选择

创建可拖拽区域时，拖拽行为可能与文本选择相冲突。 例如，当您拖动标题栏时，您可能不小心选中其中的文本。 为了避免这种情况，您需要在可拖拽区域中禁用文本选择，像这样：

```css
.titlebar {
  -webkit-user-select: none;
  -webkit-app-region: drag;
}
```





## 多线程

[官方文档]: https://www.electronjs.org/zh/docs/latest/tutorial/multithreading
[Electron-vite 导入 Worker Threads]: https://cn.electron-vite.org/guide/assets#%E5%AF%BC%E5%85%A5-worker-threads



需把`webPreferences`中的`nodeIntegrationInWorker`选项设置为`true`

```js
win = new BrowserWindow({
  webPreferences: {
    nodeIntegrationInWorker: true
  }
})
```

`nodeIntegrationInWorker` 可以独立于`nodeIntegration`使用，但`sandbox`必须不能设置为`true`

```js
// main
import createWorker from './worker?nodeWorker'
const myWorker = createWorker({ workerData: 'worker' })

myWorker.postMessage(data)
myWorker.on('message', (message) => {
  port.postMessage(message)
  port.close()
})
```

```js
// worker.js
import { parentPort } from 'worker_threads'
import fs from 'fs'

const port = parentPort
if (!port) throw new Error('IllegalState')

/**
 * readAndConvertImageToBase64
 * 读取图片将其转化为base64
 * @param {Array} files 图片路径
 */
port.on('message', (files) => {
  const result = [] as unknown[]
  files.forEach(function (file) {
    const data = fs.readFileSync(file)
    result.push('data:image/png;base64,' + data.toString('base64'))
  })
  port.postMessage(result)
})

```





# 关于构建

[分发]: https://cn.electron-vite.org/guide/distribution
[打包您的应用程序]: https://www.electronjs.org/zh/docs/latest/tutorial/%E6%89%93%E5%8C%85%E6%95%99%E7%A8%8B
[Electron-builder打包和自动更新]: https://www.cnblogs.com/konghuanxi/p/17629100.html



## NSIS安装引导

electron-builder 生成的安装包默认是一键安装，也就是无法选择安装路径等。这时候就需要用到 NSIS 了（注意：NSIS 只适用于 Window 平台）

只需要修改 electron-builder.yml 即可

```yaml
nsis:
  oneClick: false # 创建一键安装程序还是辅助安装程序（默认是一键安装）
  allowElevation: true # 是否允许请求提升，如果为false，则用户必须使用提升的权限重新启动安装程序 （仅作用于辅助安装程序）
  allowToChangeInstallationDirectory: true # 是否允许修改安装目录 （仅作用于辅助安装程序）
  createStartMenuShortcut: true # 是否创建开始菜单快捷方式
  artifactName: ${productName}-${version}-${platform}-${arch}.${ext}
  shortcutName: ${productName}
  uninstallDisplayName: ${productName}
  createDesktopShortcut: always
```

详见：[NsisOptions](https://www.electron.build/configuration/nsis)



##  Github Action

1. Settings → Developer Settings  → Peronall access tokens → Tokens → Generate new token → Generate new token (classic) 

   ![1708700959632.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/652440a2be864e7db2b3b161ece7dd0f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1202&h=344&s=49708&e=png&b=ffffff)


2. 配置选择如下

      ![1708701107325.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/142a31044446454da0deea66d0e2b907~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=729&h=441&s=32882&e=png&b=ffffff)


3. 仓库设置 token，项目 → Settings → Secrets and variables → Actions
![1708701243484.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2951eda34a044f4abf46570b49524cad~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1208&h=709&s=51516&e=png&b=ffffff)



4. 添加 Github Action 文件，在`.github/workflows` 下创建 `build.yml`文件

[参考 electron-vite Github Action CI/CD]: https://cn.electron-vite.org/guide/distribution#github-action-ci-cd

```yml
name: Build/release Electron app

# on: workflow_dispatch 手动触发工作流程
# 当Tag提交时自动触发
on:
  push:
    tags:
      - v*.*.*

jobs:
  release:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        # os: [ubuntu-latest, macos-latest, windows-latest]
        os: [windows-latest]

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v3

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16

      - name: Install Dependencies
        run: npm install

      # - name: build-linux
      #   if: matrix.os == 'ubuntu-latest'
      #   run: npm run build:linux

      # - name: build-mac
      #   if: matrix.os == 'macos-latest'
      #   run: npm run build:mac

      - name: build-win
        if: matrix.os == 'windows-latest'
        run: npm run build:win
        env:
          GH_TOKEN: ${{ secrets.ACCESS_TOKEN }}

      - name: release
        uses: softprops/action-gh-release@v1
        with:
          draft: false
          files: |
              dist/*.exe
         	  dist/*.exe.blockmap
         	  dist/latest.yml
            # dist/*.exe
            # dist/*.zip
            # dist/*.dmg
            # dist/*.AppImage
            # dist/*.snap
            # dist/*.deb
            # dist/*.rpm
            # dist/*.tar.gz
            # dist/*.yml
            # dist/*.blockmap
        env:
        
          GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
```







### 报错

- Error: GitHub Personal Access Token is not set, neither programmatically, nor using env "GH_TOKEN"

  - ```
    release.yml
          - name: build-win
            if: matrix.os == 'windows-latest'
            run: npm run build:win
            env:
              GH_TOKEN: ${{ secrets.ACCESS_TOKEN }}
              
              
    package.josn
    	  "build:win": "npm run build && electron-builder --win --config",
    ```

    







## 自动更新

[Electron-builder打包和自动更新]: https://www.cnblogs.com/konghuanxi/p/17629100.html
[使用 Electron Builder 分发应用程序]: https://cn.electron-vite.org/guide/distribution#%E4%BD%BF%E7%94%A8-electron-builder-%E5%88%86%E5%8F%91%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F
[简单且详细地实现 Electron 自动更新（Auto Update）]: https://juejin.cn/post/7320152980211499060
[基于Github Actions完成Electron自动打包、发布及更新]: https://juejin.cn/post/7094865414353584164#heading-1



以下内容基于 `electron-vite` 开发进行的配置





### .github\workflows\release.yml

Github Action 配置文件，需要注意的是，在打包的时候需要添加 `env:GH_TOKEN: ${{ secrets.ACCESS_TOKEN }}`

```YML
name: Build/release Electron app

on:
  push:
    tags:
      - v*.*.*

jobs:
  release:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [windows-latest]

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v3

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16

      - name: Install Dependencies
        run: npm install

      # - name: build-linux
      #   if: matrix.os == 'ubuntu-latest'
      #   run: npm run build:linux

      # - name: build-mac
      #   if: matrix.os == 'macos-latest'
      #   run: npm run build:mac

      - name: build-win
        if: matrix.os == 'windows-latest'
        run: npm run build:win
        env:
          GH_TOKEN: ${{ secrets.ACCESS_TOKEN }}

      - name: release
        uses: softprops/action-gh-release@v1
        with:
          draft: false
          files: |
            dist/*.exe
            dist/*.exe.blockmap
            dist/latest.yml
        env:
          GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}

```



### dev-app-update.yml

```yml
provider: github
owner: 100110001
repo: electron
```



### electron-builder.yml

需要在文件中添加以下内容

```yml
publish:
  provider: github
  owner: 100110001
  repo: electron
releaseInfo:
  # normal 弹窗 / major 强制更新
  releaseName: 'normal'
```





### package.json

```json
    "build:win": "npm run build && electron-builder --win --config",
```



### main.js

```js
// 主进程跟渲染进程通信
const message = {
  version: '当前版本信息',
  error: '检查更新出错!',
  checking: '正在检查更新...',
  updateAva: '检测到新版本...',
  updateNotAva: '现在使用的就是最新版本，不用更新!',
  updateDownloadedSuccess: '更新资源，下载成功!',
  updateDownloadedProgress: '更新资源，下载中...'
}

// 发送消息给渲染进程
const sendUpdateMessage = (...args) => mainWindow.webContents.send('message', ...args)

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
  // 获取 版本号、发布日志
  sendUpdateMessage('updateAva', info)
  // 这里我们可以做一个提示，让用户自己选择是否进行更新
  dialog
    .showMessageBox({
      type: 'info',
      title: '应用有新的更新',
      message: '发现新版本，是否现在更新？',
      buttons: ['是', '否']
    })
    .then(({ response }) => {
      if (response === 0) {
        // 下载更新
        autoUpdater.downloadUpdate()
        sendUpdateMessage(message.updateAva)
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

// 我们需要主动触发一次更新检查
ipcMain.on('checkForUpdate', () => {
  // 当我们收到渲染进程传来的消息，主进程就就进行一次更新检查
  autoUpdater.checkForUpdates()
})

// 当前引用的版本告知给渲染层
ipcMain.on('checkAppVersion', () => {
  sendUpdateMessage('version', app.getVersion())
})
```



### preload.js

```js
const ipc = {
  render: {
    // 主进程发出的通知
    send: ['checkForUpdate', 'checkAppVersion'],
    // 渲染进程发出的通知
    receive: ['message']
  }
}
```





### renderer.js

```js

import { onMounted, onUnmounted } from 'vue'
import { Notification } from '@arco-design/web-vue'

const NotificationConfig = {
  id: 'update',
  title: '检查更新',
  content: '',
  position: 'bottomRight'
}
const message = {
  version: '当前版本信息',
  error: '检查更新出错!',
  checking: '正在检查更新...',
  updateAva: '检测到新版本...',
  updateNotAva: '现在使用的就是最新版本，不用更新!',
  updateDownloadedSuccess: '更新资源，下载成功!',
  updateDownloadedProgress: '更新资源，下载中...'
}

const handleCheckUpdate = () => window.electronAPI.ipcRender.send('checkAppVersion')

onMounted(() => {
  // 接收主进程发来的通知，告诉用户当前应用是否需要更新
  window.electronAPI.ipcRender.receive('message', (type, data) => {
    console.log('message', type, data)
    let msg = {}

    if (type == 'version') {
      msg = Object.assign(NotificationConfig, { content: `当前版本信息: ${data}` })
      window.electronAPI.ipcRender.send('checkForUpdate')
    } else if (type == 'updateDownloadedProgress') {
      const progress = parseInt(data.percent, 10)
      msg = Object.assign(NotificationConfig, {
        content: `${message[type]}: ${progress}%`
      })
    } else if (type == 'updateAva') {
      msg = Object.assign(NotificationConfig, {
        content: `${message[type]}: ${data.version}`
      })
    } else {
      msg = Object.assign(NotificationConfig, {
        content: message[type]
      })
    }

    Notification.info(msg)
  })
})

onUnmounted(() => {
  Notification.clear()
})
```




# Github与Gitee同步

[仓库镜像管理]: https://help.gitee.com/repository/settings/sync-between-gitee-github

如何进行Github与Gitee的同步，Gitee中有完整示例教程，但是有以下注意的点

- 仓库在进行同步的操作时，如果两三分钟没有同步完成，那基本就可以重新开始了
- 如果提交的代码中包 `.github/workflows`的文件，也就是想要使用`Github Action`时，在申请`Tokens`的时候 要把以下这些全部勾选 `repo`、`workflow`、`write:packages`、`admin:org`、`admin:repo_hook`。也就是你要同时把Github Action 的权限和 Gitee与Github 同步的权限都要勾选上





# electron-vite

## nodeIntegration

[nodeIntegration]: https://cn.electron-vite.org/guide/dev#nodeintegration

目前，electron-vite 不支持 `nodeIntegration`。其中一个重要的原因是 Vite 的 HMR 是基于原生 ESM 实现的。但是还有一种支持方式就是使用 `require` 导入 node 模块，不太优雅。或者你可以使用插件 [vite-plugin-commonjs-externals](https://github.com/xiaoxiangmoe/vite-plugin-commonjs-externals) 来处理。

也许将来会有更好的方法来支持。但需要注意的是，使用预加载脚本是一个更好、更安全的选择。



## 热重载

[什么是热重载]: https://cn.electron-vite.org/guide/hot-reloading

热重载是指在主进程或预加载脚本模块发生变化时快速重新构建并重启 Electron 程序。事实上，并不是真正的热重载，而是类似的。它为开发者带来了很好的开发体验。

electron-vite 是怎么做到的：

- 启用 rollup 监视器, 观察主进程或预加载脚本的模块变化。
- 当主进程的模块变化时，重新构建并重启 Electron 程序。
- 当预加载脚本的模块变化时，重新构建并触发渲染进程重载。



```js
"dev": "chcp 65001 && electron-vite dev --watch",
```



## 源代码保护

[bytecodePlugin]: https://cn.electron-vite.org/guide/source-code-protection#%E5%BC%80%E5%90%AF%E5%AD%97%E8%8A%82%E7%A0%81%E6%8F%92%E4%BB%B6%E4%BF%9D%E6%8A%A4%E6%BA%90%E4%BB%A3%E7%A0%81

开启字节码插件保护源代码，启用 `bytecodePlugin` 插件：

```js
import { defineConfig, bytecodePlugin } from 'electron-vite'

export default defineConfig({
  main: {
    plugins: [bytecodePlugin()]
  },
  preload: {
    plugins: [bytecodePlugin()]
  },
  renderer: {
    // ...
  }
})
```

`bytecodePlugin` 仅适用于生产阶段构建并且只支持主进程和预加载脚本。

需要注意的是，预加载脚本需要禁用 `sandbox` 才能支持字节码，因为字节码是基于 Node 的 `vm` 模块实现。从 Electron 20 开始，渲染器默认会被沙箱化，所以如果你想使用字节码来保护预加载脚本，你需要设置 `sandbox: false`。



## 压缩资源

[vite-plugin-compression]: https://github.com/vbenjs/vite-plugin-compression/blob/main/README.zh_CN.md

`vite-plugin-compression` 使用 `gzip` 或者 `brotli` 来压缩资源.

https://www.npmjs.com/package/unplugin-vue-components



## 按需加载

[arco 文档]: https://arco.design/vue/docs/start

与组件库主题（Arco 插件）

```js
import { vitePluginForArco } from '@arco-plugins/vite-vue'
export default defineConfig({
  plugins: [
    vue(),
    vitePluginForArco({
      style: 'css'
    })
  ]
})
```



## 代码分割

[产物分块策略]: https://cn.vitejs.dev/guide/build#chunking-strategy
[分块策略]: https://cn.electron-vite.org/guide/build#%E5%88%86%E5%9D%97%E7%AD%96%E7%95%A5

```js
// vite.config.js
import { splitVendorChunkPlugin } from 'vite'
export default defineConfig({
  plugins: [splitVendorChunkPlugin()],
})
```



## 模块分析

可视化并分析您的 Rollup 包，看看哪些模块占用了空间。

[rollup-plugin-visualizer]: https://www.npmjs.com/package/rollup-plugin-visualizer

```js
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [visualizer() as PluginOption],
})
```





## 外部依赖

[外部依赖]: https://cn.electron-vite.org/guide/build#%E5%88%86%E5%9D%97%E7%AD%96%E7%95%A5







# 最佳实践

[最佳实践]: https://cn.electron-vite.org/guide/introduction#%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5

很多开发者和社区模板，都会通过开启node集成（`nodeIntegration`）和关闭上下文隔离（`contentIsolation`）的方式来开发。尽管这可以获得一点点的开发效率，但不应该被推荐，这是很不安全的做法。在 Electron 中，不仅仅是浏览器，它还提供很多强大的原生能力，如文件系统访问，shell等。事实上，最流行的 Electron 应用程序（slack、visual studio code 等）都不会这样做。

所以，electron-vite 的设计思路也会遵循这一点，包括推荐的项目结构、内置配置等。

