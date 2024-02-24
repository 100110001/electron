<template>
  <div>
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" title="Tab 1">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="暗黑模式">
            <a-radio-group
              v-model="configuration.nativeTheme.themeSource"
              type="button"
              @change="change"
            >
              <a-radio value="system">system</a-radio>
              <a-radio value="light">light</a-radio>
              <a-radio value="dark">dark</a-radio>
            </a-radio-group>
          </a-descriptions-item>

          <a-descriptions-item label="更新"> <CheckUpdate /> </a-descriptions-item>
        </a-descriptions>
      </a-tab-pane>
      <a-tab-pane key="2" title="Tab 2">
        <pre><code class="language-json">{{JSON.stringify(state, null,4)}}</code></pre>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { reactive, onMounted, toRefs } from 'vue'
import { useAppStoreWithOut } from '@renderer/store/modules/app'

import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'

// Then register the languages you need
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)

const state = reactive({
  configuration: {
    pythonServer: false,
    browserWindow: {
      title: 'levi app',
      height: 810,
      width: 1440,
      show: false,
      resizable: false,
      transparent: true,
      autoHideMenuBar: false,
      frame: true,
      hasShadow: true,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#2a2a2b',
        symbolColor: '#fff',
        height: 24
      }
    },
    nativeTheme: { themeSource: 'dark', shouldUseDarkColors: true }
  }
})
const appStore = useAppStoreWithOut()

onMounted(async () => {
  hljs.highlightAll()
  state.configuration = appStore.getConfiguration
})

const change = (value) => {
  window.electronAPI.setConfiguration({
    nativeTheme: {
      themeSource: value
    }
  })
}

const { configuration } = toRefs(state)
</script>

<style scoped>
.hljs {
  color: var(--color-text-2);
  background: var(--color-bg-3);
}
</style>
