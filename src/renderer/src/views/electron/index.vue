<template>
  <div>
    <a-space>
      <a-button @click="chooseFile">选择文件</a-button>
      <a-button @click="exportData"> 导出数据 </a-button>
    </a-space>
  </div>
</template>

<script setup>
const chooseFile = async () => {
  const filePaths = await window.electronAPI.openFile()
  console.log('filePaths', filePaths)
  window.electronAPI.getFileData(filePaths, (value) => {
    console.log('value', value)
  })
}

const exportData = async () => {
  window.electronAPI.saveFile({
    header: [[1, 2, 3]],
    body: [[4, 5, 6]]
  })
}
</script>
