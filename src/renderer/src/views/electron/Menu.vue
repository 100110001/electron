<template>
  <div>右键创建菜单</div>
</template>

<script lang="ts" setup>
import { onUnmounted } from 'vue'
import { onMounted } from 'vue'

onMounted(() => {
  window.addEventListener('contextmenu', handleContextMenu)
  window.electron.ipcRenderer.on('context-menu-command', (e, command) => {
    console.log(e, command)
  })
})

onUnmounted(() => {
  window.removeEventListener('contextmenu', handleContextMenu)
})

function handleContextMenu(e) {
  e.preventDefault()
  window.electron.ipcRenderer.send('show-context-menu')
}
</script>
