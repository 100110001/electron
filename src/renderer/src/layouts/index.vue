<template>
  <a-layout class="layout-demo">
    <a-layout-sider
      :width="220"
      collapsible
      :collapsed="menuState.collapsed"
      style="height: 100vh"
      @collapse="onCollapse"
    >
      <div class="logo" />
      <a-menu
        :selected-keys="menuState.selectedKeys"
        style="user-select: none"
        @menu-item-click="menuClick"
      >
        <template v-for="item in menuState.items">
          <a-sub-menu v-if="item.children && item.children.length" :key="item.path">
            <template #icon>
              <component
                :is="item.icon"
                v-if="typeof item.icon === 'function'"
                style="margin-right: 4px"
              ></component>
              <img v-else :src="item.icon" width="14px" style="margin-right: 4px" />
            </template>
            <template #title>{{ item.title }}</template>

            <a-menu-item v-for="child in item.children" :key="child.path">
              {{ child.meta.title }} {{ child.key }}
            </a-menu-item>
          </a-sub-menu>

          <a-menu-item v-else :key="item.key">
            <component :is="item.icon" v-if="typeof item.icon === 'function'"></component>
            <img v-else :src="item.icon" width="14px" style="margin-right: 16px" />
            {{ item.title }}
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout class="layout-main">
      <a-layout-header class="layout-header">
        <div class="dragarea"></div>
        <div class="action_button" @click="action('minimize')"><icon-minus /></div>
        <div class="action_button" @click="action('maximize')"><icon-expand /></div>
        <div class="action_button action_button_close" @click="action('close')">
          <icon-close />
        </div>
      </a-layout-header>

      <a-watermark content="levi" class="layout-watermark">
        <a-layout-content>
          <div style="padding: 16px">
            <RouterView v-slot="{ Component }">
              <Transition appear enter-active-class="animate__animated animate__fadeIn">
                <component :is="Component"></component>
              </Transition>
            </RouterView>
          </div>
        </a-layout-content>
      </a-watermark>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { onMounted, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuState = reactive({
  items: [],
  collapsed: false,
  selectedKeys: []
})

onMounted(() => {
  const { children } = router.getRoutes().filter((item) => item.path === '/')[0]

  menuState.items = children.map((item) => {
    item = { ...item, ...item.meta }
    item.key = item.path
    item.children &&
      item.children.map((el) => {
        el = { ...el, ...el.meta }
        el.key = item.path + el.path
        delete el.component
        return el
      })

    delete item.component
    return item
  })
})

watch(route, (to) => (menuState.selectedKeys = [to.path]), { immediate: true })

const onCollapse = (val) => (menuState.collapsed = val)

const menuClick = (item) => router.push(item)

const action = (type) => window.electronAPI.service({ type })
</script>

<style lang="less" scoped>
.layout-header {
  height: 24px;
  background: var(--color-bg-3);
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .dragarea {
    -webkit-app-region: drag;
    flex: 1;
    height: 100%;
  }
  .action_button {
    display: flex;
    width: 48px;
    height: 24px;
    justify-content: center;
    align-items: center;
    color: var(--color-text-1);
    &:hover {
      background-color: #bebebe50;
      transition: all 0.3s;
    }
  }
  .action_button_close {
    &:hover {
      background-color: #ff000050;
    }
  }
}
.layout-demo {
  min-height: 100vh;
  background: #e8e8e8;
}
.layout-demo :deep(.arco-layout-sider) .logo {
  height: 32px;
  margin: 12px 8px;
  background: rgba(255, 255, 255, 0.2);
}
.layout-demo :deep(.arco-layout-sider) .logo {
  height: 32px;
  margin: 12px 8px;
  background: rgba(255, 255, 255, 0.2);
  -webkit-app-region: drag;
}
.layout-demo :deep(.arco-layout-sider-light) .logo {
  background: var(--color-fill-2);
}
.layout-main {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.layout-watermark {
  flex: 1;
}

.layout-demo :deep(.arco-layout-content) {
  color: var(--color-text-2);
  font-weight: 400;
  font-size: 14px;
  background: var(--color-bg-3);
  // margin: 16px;
  overflow: auto;
  height: 100%;
  // min-height: calc(100vh - 24px);
}
/* .layout-demo :deep(.arco-layout-sider) .logo {
  height: 32px;
  margin: 12px 8px;
  background: rgba(255, 255, 255, 0.2);
}
.layout-demo :deep(.arco-layout-sider-light) .logo {
  background: var(--color-fill-2);
}
.layout-demo :deep(.arco-layout-content) {
  color: var(--color-text-2);
  font-weight: 400;
  font-size: 14px;
  background: var(--color-bg-3);
}
.layout-demo :deep(.arco-layout-footer),
.layout-demo :deep(.arco-layout-content) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: var(--color-white);
  font-size: 16px;
  font-stretch: condensed;
  text-align: center;
} */

/* animate__slideInRight */
.fade-enter-active,
.fade-leave-active {
  /* transition: opacity 0.3s ease; */
  animation: animate__slideOutLeft; /* referring directly to the animation's @keyframe declaration */
  animation-duration: 0.3s; /* don't forget to set a duration! */
}

.fade-enter-from,
.fade-leave-to {
  /* opacity: 0; */
  animation: animate__slideOutRight; /* referring directly to the animation's @keyframe declaration */
  animation-duration: 0.3s; /* don't forget to set a duration! */
}
</style>
