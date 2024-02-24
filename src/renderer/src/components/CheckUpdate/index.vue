<template>
  <a-button @click="handleCheckUpdate">检查更新</a-button>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { Notification } from '@arco-design/web-vue'

const NotificationConfig = {
  id: 'update',
  title: '检查更新',
  content: '',
  position: 'bottomRight',
  type: 'info',
  duration: 3000
}
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

const handleCheckUpdate = () => window.electronAPI.ipcRender.send('checkAppVersion')

onMounted(() => {
  // 接收主进程发来的通知，告诉用户当前应用是否需要更新
  window.electronAPI.ipcRender.receive('message', receiveMessage)
})

function receiveMessage(type, data) {
  console.log('message', type, data)
  let msg = {}

  if (type == 'version') {
    msg = Object.assign(NotificationConfig, { content: `当前版本信息: ${data}` })
    window.electronAPI.ipcRender.send('checkForUpdate')
  } else if (type == 'updateDownloadedProgress') {
    console.log('data', data)
    const progress = parseInt(data.percent, 10)
    msg = Object.assign(NotificationConfig, {
      content: `${message[type]}: ${progress}%`
    })
  } else if (type == 'updateCompleted' || type == 'updateNotAva') {
    msg = Object.assign(NotificationConfig, {
      content: message[type],
      type: 'success'
    })
  } else if (type == 'updateAva') {
    msg = Object.assign(NotificationConfig, {
      content: message[type]
    })
  } else {
    msg = Object.assign(NotificationConfig, {
      content: message[type]
    })
  }

  Notification[msg.type](msg)
}

onUnmounted(() => {
  Notification.clear()
})
</script>
